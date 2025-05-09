/**
 * Валидация форм Webflow
 */

/**
 * Проверка минимальной длины текстового поля
 */
const validateLength = (input: HTMLInputElement, minLength: number): boolean => {
  return input.value.trim().length > minLength;
};

/**
 * Проверка формата телефона (базовая проверка)
 */
const validatePhone = (input: HTMLInputElement): boolean => {
  // Удаляем все нецифровые символы для проверки (пробелы, дефисы, скобки, точки)
  const phoneDigits = input.value.replace(/\D/g, '');

  // Проверяем только минимальное количество цифр (минимум 5)
  return phoneDigits.length >= 5;
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
 * Управление классами чекбокса
 */
const updateCheckboxClasses = (input: HTMLInputElement, checkbox: HTMLElement): void => {
  const isChecked = input.getAttribute('data-checked') === 'true';
  console.log('updateCheckboxClasses:', {
    isChecked,
    checkboxClasses: checkbox.classList.toString(),
    inputDataChecked: input.getAttribute('data-checked'),
  });

  if (isChecked) {
    checkbox.classList.add('w--redirected-checked');
  } else {
    checkbox.classList.remove('w--redirected-checked');
  }

  console.log('After update:', {
    checkboxClasses: checkbox.classList.toString(),
  });
};

/**
 * Проверка чекбокса
 */
const validateCheckbox = (input: HTMLInputElement): boolean => {
  const isValid = input.checked;
  console.log('validateCheckbox:', {
    checked: input.checked,
    dataChecked: input.getAttribute('data-checked'),
  });

  // Добавляем атрибут, отражающий состояние чекбокса
  input.setAttribute('data-checked', isValid.toString());

  // Обновляем классы чекбокса
  const checkbox = input.closest('.input-wrapper')?.querySelector('.w-checkbox-input');
  if (checkbox) {
    updateCheckboxClasses(input, checkbox as HTMLElement);
  }

  return isValid;
};

/**
 * Показать сообщение об ошибке для конкретного инпута
 */
const showError = (wrapper: Element, input: HTMLElement): void => {
  // Для чекбокса ищем специальный элемент
  const isCheckbox = wrapper.querySelector('input[type="checkbox"]');
  if (isCheckbox) {
    const checkbox = wrapper.querySelector('.w-checkbox-input.checkbox') as HTMLElement;
    if (checkbox) {
      checkbox.classList.add('is-error');
    }
  } else {
    // Добавляем класс is-error для инпута
    input.classList.add('is-error');
  }

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
  // Для чекбокса ищем специальный элемент
  const isCheckbox = wrapper.querySelector('input[type="checkbox"]');
  if (isCheckbox) {
    const checkbox = wrapper.querySelector('.w-checkbox-input.checkbox') as HTMLElement;
    if (checkbox) {
      checkbox.classList.remove('is-error');
    }
  } else {
    // Удаляем класс is-error для инпута
    input.classList.remove('is-error');
  }

  // Находим блок с ошибкой и скрываем его
  const errorLabel = wrapper.querySelector('.input-error-label');
  if (errorLabel) {
    errorLabel.setAttribute('style', 'display: none;');
  }
};

/**
 * Валидация одного инпута
 */
const validateInput = (wrapper: Element, showErrors = true, forceShowErrors = false): boolean => {
  const input = wrapper.querySelector('input, textarea') as HTMLInputElement;
  const checkbox = wrapper.querySelector('.w-checkbox-input.checkbox') as HTMLElement;
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

    // Показываем или скрываем ошибку для чекбокса
    if (showErrors && (input.hasAttribute('data-touched') || forceShowErrors)) {
      if (!isValid) {
        showError(wrapper, checkbox || input);
      } else {
        hideError(wrapper, checkbox || input);
      }
    }
    return isValid;
  }

  // Показать или скрыть ошибку только если требуется
  // и пользователь взаимодействовал с этим инпутом или требуется показ для всех
  if (showErrors && (input.hasAttribute('data-touched') || forceShowErrors)) {
    if (!isValid) {
      showError(wrapper, input);
    } else {
      hideError(wrapper, input);
    }
  }

  return isValid;
};

/**
 * Валидация всей формы
 */
const validateForm = (
  form: HTMLFormElement,
  showErrors = true,
  forceShowErrors = false
): boolean => {
  const inputWrappers = form.querySelectorAll('.input-wrapper');
  let isFormValid = true;

  // Валидируем каждый инпут
  inputWrappers.forEach((wrapper) => {
    const inputValid = validateInput(wrapper, showErrors, forceShowErrors);
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

      // Специальная обработка для чекбоксов
      if (input.hasAttribute('input-validation-checkbox')) {
        const checkboxLabel = wrapper.querySelector('.w-checkbox') as HTMLElement;
        if (checkboxLabel) {
          checkboxLabel.addEventListener('click', () => {
            // Небольшая задержка, чтобы дать Webflow обновить состояние
            setTimeout(() => {
              validateInput(wrapper, true);
              validateForm(form, true);
            }, 0);
          });
        }

        // Инициализация состояния чекбокса при загрузке
        if (input.checked) {
          input.setAttribute('data-checked', 'true');
          const checkbox = wrapper.querySelector('.w-checkbox-input') as HTMLElement;
          if (checkbox) {
            checkbox.classList.add('w--redirected-checked');
          }
        }

        // Добавляем обработчик изменений для самого инпута (на случай программного изменения)
        input.addEventListener('change', () => {
          validateInput(wrapper, true);
          validateForm(form, true);
        });
      } else {
        // Добавляем обработчики для отслеживания взаимодействия с полем
        input.addEventListener('focus', () => {
          // Помечаем инпут как взаимодействованный
          input.setAttribute('data-touched', 'true');
        });

        // Ограничиваем ввод только цифрами и некоторыми специальными символами для телефонных номеров
        if (input.hasAttribute('input-validation-phone')) {
          input.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            // Разрешаем только цифры, плюс, скобки, дефисы, пробелы и точки
            target.value = target.value.replace(/[^\d+\-()\s.]/g, '');
            validateInput(wrapper, true);
            validateForm(form, true);
          });
        } else {
          // Валидация при вводе и потере фокуса для остальных полей
          input.addEventListener('input', () => {
            validateInput(wrapper, true);
            validateForm(form, true);
          });
        }

        input.addEventListener('blur', () => {
          validateInput(wrapper, true);
          validateForm(form, true);
        });
      }
    });

    // Блокируем отправку формы, если есть ошибки
    form.addEventListener('submit', (e) => {
      const isValid = validateForm(form, true, true); // Показываем все ошибки при отправке
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
