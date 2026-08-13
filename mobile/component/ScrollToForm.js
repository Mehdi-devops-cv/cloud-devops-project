import { useCallback } from 'react';
import { Dimensions, InteractionManager } from 'react-native';

/**
 * Hook utilitaire pour scroller un ScrollView afin de centrer un formulaire
 * lorsqu'il est rendu. Renvoie un handler à utiliser en onLayout.
 *
 * Usage:
 * const handleFormLayout = useScrollToForm(scrollViewRef);
 * <View onLayout={handleFormLayout}>...</View>
 */
export default function useScrollToForm(scrollViewRef) {
  const windowHeight = Dimensions.get('window').height;

  const handleFormLayout = useCallback(
    (e) => {
      try {
        const { y } = e.nativeEvent.layout;
        // Instead of centering, scroll so the top of the form is near the top of the viewport
        // leave a small margin for the header/status bar
        const TOP_MARGIN = 12;
        const offset = Math.max(0, y - TOP_MARGIN);
        if (scrollViewRef && scrollViewRef.current && typeof scrollViewRef.current.scrollTo === 'function') {
          // Wait for interactions/layout to finish to avoid racing with animations
          let handled = false;
          InteractionManager.runAfterInteractions(() => {
            handled = true;
            scrollViewRef.current.scrollTo({ y: offset, animated: true });
          });

          // Fallback in case runAfterInteractions never runs (rare): force after 200ms
          setTimeout(() => {
            if (!handled) {
              scrollViewRef.current.scrollTo({ y: offset, animated: true });
            }
          }, 200);
        }
      } catch (err) {
        // ignore silently — best-effort
      }
    },
    [scrollViewRef]
  );

  return handleFormLayout;
}
