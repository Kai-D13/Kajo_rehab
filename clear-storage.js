// Clear corrupted localStorage data
console.log('🗑️ Clearing corrupted localStorage...');

// Clear all kajo-related data
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.includes('kajo')) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log('🗑️ Removed:', key);
});

console.log('✅ localStorage cleared. Please refresh the page.');

// Also clear sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage cleared.');
