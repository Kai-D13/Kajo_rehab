# 🧹 PROJECT CLEANUP SCRIPT

## 📁 FILES TO DELETE (Không cần thiết cho dự án chính)

### ❌ **Admin System Files** (Đã disable admin workflow)
- admin-dashboard-backup.html
- admin-dashboard-fixed.html  
- admin-dashboard-localhost.html
- admin-dashboard.html
- admin-server-production.js
- admin-server.js
- admin-simple.html
- admin-system/ (entire folder)
- reception-system.html

### ❌ **Documentation Files** (Development docs - không cần cho production)
- ADMIN_SYSTEM_SPEC.md
- ADVANCED_BOOKING_SYSTEM.ts
- ENHANCED_BOOKING_LOGIC.ts
- FINAL_STRATEGIC_PLAN.md
- PHASE_1_TASKS.md
- PHASE_2_OA_INTEGRATION.md
- PROJECT_BUILD_PLAN.md
- PRODUCTION-GUIDE.md

### ❌ **Temporary/Unused Files**
- undefined/ (temporary folder)
- ecosystem.config.json (PM2 config - not needed for Zalo Mini App)
- start-production.ps1 (replaced with npm scripts)

### ❌ **Database Files** (Using Supabase, not local DB)
- database/ (production-schema.sql - will be in Supabase)

## ✅ **FILES TO KEEP** (Essential for project)

### ✅ **Core Application**
- src/ (entire source code)
- package.json & package-lock.json
- tsconfig.json
- vite.config.mts
- tailwind.config.js
- postcss.config.js

### ✅ **Configuration**
- app-config.json (Zalo Mini App config)
- zmp-cli.json (Zalo CLI config) 
- index.html (entry point)
- .env & .env.local (environment variables)
- .gitignore

### ✅ **Documentation** (Keep for reference)
- README.md
- docs/ (analysis and final reports)

## 🎯 **CLEANUP IMPACT**
- Remove ~15-20 unused files
- Clean admin system remnants
- Remove development documentation clutter  
- Keep only essential production files
- Reduce project size significantly
