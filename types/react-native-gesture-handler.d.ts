declare module 'react-native-gesture-handler' {
    import { ComponentType } from 'react';
    import { GestureResponderEvent, ViewProps } from 'react-native';
  
    export interface PanGestureHandlerProps extends ViewProps {
      onGestureEvent?: (event: GestureResponderEvent) => void;
      onHandlerStateChange?: (event: GestureResponderEvent) => void;
    }
  
    export const PanGestureHandler: ComponentType<PanGestureHandlerProps>;
    export const State: {
      UNDETERMINED: number;
      FAILED: number;
      BEGAN: number;
      CANCELLED: number;
      ACTIVE: number;
      END: number;
    };
  }
  