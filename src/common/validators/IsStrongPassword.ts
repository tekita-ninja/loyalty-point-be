import { registerDecorator, ValidationOptions } from 'class-validator';

interface StrongPasswordOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSymbol?: boolean;
}

export function IsStrongPassword(
  options: StrongPasswordOptions = {},
  validationOptions?: ValidationOptions,
) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSymbol = true,
  } = options;

  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          if (value.length < minLength) return false;
          if (requireUppercase && !/[A-Z]/.test(value)) return false;
          if (requireLowercase && !/[a-z]/.test(value)) return false;
          if (requireNumber && !/[0-9]/.test(value)) return false;
          if (
            requireSymbol &&
            !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)
          )
            return false;
          return true;
        },
        defaultMessage(): string {
          const rules: string[] = [`at least ${minLength} characters`];
          if (requireUppercase) rules.push('an uppercase letter');
          if (requireLowercase) rules.push('a lowercase letter');
          if (requireNumber) rules.push('a number');
          if (requireSymbol) rules.push('a special character');

          return `Password must include ${rules.join(', ')}`;
        },
      },
    });
  };
}
