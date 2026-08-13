// Temporary shim for development to avoid importing 'expo-font' build files
// Returns fontsLoaded = true so the app skips font loading during dev.
function useFonts() {
  // mimic expo-font hook signature: returns [fontsLoaded]
  return [true];
}

module.exports = { useFonts };
