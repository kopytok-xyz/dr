import { validateForms } from '$utils/validateForm';

window.Webflow ||= [];
window.Webflow.push(() => {
  validateForms();
});
