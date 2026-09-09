import { Pressable, Text } from 'react-native';

import { colors } from '../tokens';
import { Spinner } from './Spinner';

const VARIANTS = {
  /** Teal fill, white label — the app's primary action. */
  primary: { box: 'bg-primary', label: 'text-white', spinner: colors.surface },
  /** White fill on a coloured card, e.g. the promo card's "Get $100 Credit". */
  white: { box: 'bg-surface', label: 'text-accent', spinner: colors.accent },
  /** Red outline — destructive, e.g. "Reject Bid". */
  danger: { box: 'border border-danger bg-surface', label: 'text-danger', spinner: colors.danger },
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  testID,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  testID?: string;
}) {
  const style = VARIANTS[variant];

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      className={`h-[52px] items-center justify-center rounded-md px-4 ${style.box} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
    >
      {loading ? (
        <Spinner size={24} color={style.spinner} testID={testID ? `${testID}.spinner` : undefined} />
      ) : (
        <Text className={`text-[16px] ${style.label}`}>{label}</Text>
      )}
    </Pressable>
  );
}
