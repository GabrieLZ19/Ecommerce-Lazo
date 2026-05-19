/**
 * Validadores reutilizables para formularios
 */

export const validators = {
  /**
   * Validar email
   */
  email: (email: string): { valid: boolean; message?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      return { valid: false, message: "El email es requerido" };
    }
    if (!emailRegex.test(email)) {
      return { valid: false, message: "El email no es válido" };
    }
    return { valid: true };
  },

  /**
   * Validar contraseña fuerte
   * Requisitos:
   * - Mínimo 8 caracteres
   * - Al menos 1 mayúscula
   * - Al menos 1 minúscula
   * - Al menos 1 número
   * - Opcional: 1 carácter especial
   */
  password: (
    password: string,
  ): {
    valid: boolean;
    message?: string;
    requirements?: { [key: string]: boolean };
  } => {
    const requirements = {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    if (!password) {
      return {
        valid: false,
        message: "La contraseña es requerida",
        requirements,
      };
    }

    if (!requirements.hasMinLength) {
      return {
        valid: false,
        message: "La contraseña debe tener mínimo 8 caracteres",
        requirements,
      };
    }

    if (!requirements.hasUpperCase) {
      return {
        valid: false,
        message: "Debe incluir al menos 1 letra mayúscula",
        requirements,
      };
    }

    if (!requirements.hasLowerCase) {
      return {
        valid: false,
        message: "Debe incluir al menos 1 letra minúscula",
        requirements,
      };
    }

    if (!requirements.hasNumber) {
      return {
        valid: false,
        message: "Debe incluir al menos 1 número",
        requirements,
      };
    }

    return { valid: true, requirements };
  },

  /**
   * Validar coincidencia de contraseñas
   */
  passwordsMatch: (
    password: string,
    confirmPassword: string,
  ): { valid: boolean; message?: string } => {
    if (!confirmPassword) {
      return { valid: false, message: "Confirma tu contraseña" };
    }
    if (password !== confirmPassword) {
      return { valid: false, message: "Las contraseñas no coinciden" };
    }
    return { valid: true };
  },

  /**
   * Validar nombre
   */
  name: (name: string): { valid: boolean; message?: string } => {
    if (!name.trim()) {
      return { valid: false, message: "El nombre es requerido" };
    }
    if (name.trim().length < 2) {
      return {
        valid: false,
        message: "El nombre debe tener al menos 2 caracteres",
      };
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
      return { valid: false, message: "El nombre solo puede contener letras" };
    }
    return { valid: true };
  },

  /**
   * Validar teléfono
   */
  phone: (phone: string): { valid: boolean; message?: string } => {
    const cleanPhone = phone.replace(/\D/g, "");

    if (phone && cleanPhone.length > 0 && cleanPhone.length < 8) {
      return {
        valid: false,
        message: "El teléfono debe tener al menos 8 dígitos",
      };
    }
    if (phone && cleanPhone.length > 15) {
      return {
        valid: false,
        message: "El teléfono no puede tener más de 15 dígitos",
      };
    }
    return { valid: true };
  },
};
