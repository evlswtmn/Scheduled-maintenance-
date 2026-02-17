import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

const Typography = {
  hero: {
    fontFamily,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  title: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
  },
  bodyBold: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  caption: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400',
  },
  captionBold: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  small: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
  },
  smallBold: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
};

export default Typography;
