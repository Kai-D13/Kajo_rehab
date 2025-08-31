/**
 * 🔄 SYNC SERVICE
 * Đồng bộ dữ liệu giữa User App và Admin System
 */
export class SyncService {
  private static readonly ADMIN_API_URL = 'http://localhost:3001';
  private static readonly SYNC_INTERVAL = 10000; // 10 seconds
  private static syncTimer?: NodeJS.Timeout;

  /**
   * 🚀 Start syncing with admin API
   */
  static startSync() {
    console.log('🔄 Starting sync with admin API...');
    
    // Initial sync
    this.syncFromAdminAPI();
    
    // Set up periodic sync
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    this.syncTimer = setInterval(() => {
      this.syncFromAdminAPI();
    }, this.SYNC_INTERVAL);
  }

  /**
   * 🔄 Stop syncing
   */
  static stopSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
      console.log('⏹️ Sync stopped');
    }
  }

  /**
   * 📥 Sync appointments from admin API to localStorage
   */
  static async syncFromAdminAPI() {
    try {
      const response = await fetch(`${this.ADMIN_API_URL}/api/sync`);
      
      if (!response.ok) {
        console.log('⚠️ Admin API not available for sync');
        return;
      }

      const syncData = await response.json();
      const adminAppointments = syncData.appointments;

      // Get current localStorage appointments
      const localStored = localStorage.getItem('kajo-appointments');
      const localAppointments = localStored ? JSON.parse(localStored) : [];

      // Merge data: Admin API status takes priority
      let hasChanges = false;
      const mergedAppointments = localAppointments.map((localApt: any) => {
        const adminApt = adminAppointments.find((apt: any) => apt.id === localApt.id);
        
        if (adminApt && adminApt.status !== localApt.status) {
          console.log(`🔄 Syncing status for ${localApt.id}: ${localApt.status} → ${adminApt.status}`);
          hasChanges = true;
          return { ...localApt, status: adminApt.status, updated_at: adminApt.updated_at };
        }
        
        return localApt;
      });

      // Add new appointments from admin (if any)
      const newFromAdmin = adminAppointments.filter((adminApt: any) => 
        !localAppointments.find((localApt: any) => localApt.id === adminApt.id)
      );

      if (newFromAdmin.length > 0) {
        mergedAppointments.push(...newFromAdmin);
        hasChanges = true;
        console.log(`🔄 Added ${newFromAdmin.length} new appointments from admin`);
      }

      // Save back to localStorage if there are changes
      if (hasChanges) {
        localStorage.setItem('kajo-appointments', JSON.stringify(mergedAppointments));
        console.log('✅ Appointments synced from admin API');
        
        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent('appointmentsUpdated', { 
          detail: { appointments: mergedAppointments } 
        }));
      }

    } catch (error) {
      console.log('⚠️ Sync failed:', error instanceof Error ? error.message : 'Unknown error');
      // Don't throw - sync should be non-blocking
    }
  }

  /**
   * 📤 Send new appointment to admin API
   */
  static async sendToAdminAPI(appointment: any) {
    try {
      console.log('📡 Sending appointment to admin API:', appointment.id);

      const response = await fetch(`${this.ADMIN_API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointment)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Appointment sent to admin API:', result);
        return result;
      } else {
        console.log('⚠️ Admin API not available:', response.status);
        return null;
      }
    } catch (error) {
      console.log('⚠️ Failed to send to admin API:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * 🔄 Force sync now
   */
  static async forceSyncNow() {
    console.log('🔄 Force syncing now...');
    await this.syncFromAdminAPI();
  }
}
