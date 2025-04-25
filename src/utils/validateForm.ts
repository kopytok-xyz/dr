/**
 * Валидация форм Webflow
 */

/**
 * Проверка минимальной длины текстового поля
 */
const validateLength = (input: HTMLInputElement, minLength: number): boolean => {
  return input.value.trim().length >= minLength;
};

/**
 * Проверка формата телефона (базовая проверка)
 */
const validatePhone = (input: HTMLInputElement): boolean => {
  // Базовая проверка на цифры и минимальную длину
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(input.value.trim());
};

/**
 * Проверка email (Webflow имеет встроенную проверку,
 * но для единообразия добавляем дополнительную)
 */
const validateEmail = (input: HTMLInputElement): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input.value.trim());
};

/**
 * Проверка чекбокса
 */
const validateCheckbox = (input: HTMLInputElement): boolean => {
  return input.checked;
};

/**
 * Показать сообщение об ошибке для конкретного инпута
 */
const showError = (wrapper: Element, input: HTMLElement): void => {
  // Добавляем класс is-error для инпута
  input.classList.add('is-error');

  // Находим блок с ошибкой и показываем его
  const errorLabel = wrapper.querySelector('.input-error-label');
  if (errorLabel) {
    // Устанавливаем пользовательский текст ошибки из атрибута
    const errorTextElement = errorLabel.querySelector('[input-error-text]');
    if (errorTextElement) {
      const customErrorText = errorTextElement.getAttribute('input-error-text');
      if (customErrorText) {
        errorTextElement.textContent = customErrorText;
      }
    }

    errorLabel.setAttribute('style', 'display: flex;');
  }
};

/**
 * Скрыть сообщение об ошибке для конкретного инпута
 */
const hideError = (wrapper: Element, input: HTMLElement): void => {
  // Удаляем класс is-error для инпута
  input.classList.remove('is-error');

  // Находим блок с ошибкой и скрываем его
  const errorLabel = wrapper.querySelector('.input-error-label');
  if (errorLabel) {
    errorLabel.setAttribute('style', 'display: none;');
  }
};

/**
 * Валидация одного инпута
 */
const validateInput = (wrapper: Element, showErrors = true): boolean => {
  const input = wrapper.querySelector('input, textarea') as HTMLInputElement;
  const checkbox = wrapper.querySelector('.w-checkbox-input') as HTMLElement;
  let isValid = true;

  if (!input) return true;

  // Проверка длины
  if (input.hasAttribute('input-validation-length')) {
    const minLength = parseInt(input.getAttribute('input-validation-length') || '0', 10);
    isValid = validateLength(input, minLength);
  }

  // Проверка телефона
  if (input.hasAttribute('input-validation-phone')) {
    isValid = validatePhone(input);
  }

  // Проверка email
  if (input.type === 'email') {
    isValid = validateEmail(input);
  }

  // Проверка чекбокса
  if (input.hasAttribute('input-validation-checkbox')) {
    isValid = validateCheckbox(input);

    // Для чекбокса применяем класс к элементу .w-checkbox-input
    if (showErrors && !isValid && checkbox) {
      checkbox.classList.add('is-error');
    } else if (checkbox) {
      checkbox.classList.remove('is-error');
    }
  }

  // Показать или скрыть ошибку только если требуется
  if (showErrors) {
    if (!isValid) {
      if (input.type === 'checkbox') {
        showError(wrapper, checkbox || input);
      } else {
        showError(wrapper, input);
      }
    } else {
      if (input.type === 'checkbox') {
        hideError(wrapper, checkbox || input);
      } else {
        hideError(wrapper, input);
      }
    }
  }

  return isValid;
};

/**
 * Валидация всей формы
 */
const validateForm = (form: HTMLFormElement, showErrors = true): boolean => {
  const inputWrappers = form.querySelectorAll('.input-wrapper');
  let isFormValid = true;

  // Валидируем каждый инпут
  inputWrappers.forEach((wrapper) => {
    const inputValid = validateInput(wrapper, showErrors);
    if (!inputValid) {
      isFormValid = false;
    }
  });

  // Активируем или деактивируем кнопку отправки
  const submitButton = form.querySelector(
    'input[type="submit"], button[type="submit"]'
  ) as HTMLElement;
  if (submitButton) {
    if (isFormValid) {
      submitButton.classList.remove('is-disabled');
    } else {
      submitButton.classList.add('is-disabled');
    }
  }

  return isFormValid;
};

/**
 * Настройка валидации всех форм на странице
 */
export const validateForms = (): void => {
  // Находим все формы Webflow
  const formSections = document.querySelectorAll('.w-form');

  formSections.forEach((section) => {
    const form = section.querySelector('form') as HTMLFormElement;
    if (!form) return;

    // Скрываем все ошибки при загрузке
    const errorLabels = form.querySelectorAll('.input-error-label');
    errorLabels.forEach((label) => {
      label.setAttribute('style', 'display: none;');
    });

    // Удаляем классы ошибок с инпутов
    const errorInputs = form.querySelectorAll('.is-error');
    errorInputs.forEach((input) => {
      input.classList.remove('is-error');
    });

    // Предварительная валидация при загрузке страницы (без показа ошибок)
    validateForm(form, false);

    // Добавляем обработчики для всех инпутов
    const inputWrappers = form.querySelectorAll('.input-wrapper');
    inputWrappers.forEach((wrapper) => {
      const input = wrapper.querySelector('input, textarea') as HTMLInputElement;
      if (!input) return;

      // Валидация при вводе и потере фокуса
      input.addEventListener('input', () => {
        validateInput(wrapper, true);
        validateForm(form, true);
      });

      input.addEventListener('blur', () => {
        validateInput(wrapper, true);
        validateForm(form, true);
      });
    });

    // Блокируем отправку формы, если есть ошибки
    form.addEventListener('submit', (e) => {
      const isValid = validateForm(form, true);
      if (!isValid) {
        e.preventDefault();
        e.stopPropagation();

        // Прокрутка к первой ошибке
        const firstError = form.querySelector('.is-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  });
};
