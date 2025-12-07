let isDropdownOpen = false;
let isLanguageDropdownOpen = false;

document.addEventListener('DOMContentLoaded', () => {
  const modeDropdownTrigger = document.getElementById('mode-dropdown-trigger');
  const modeDropdownMenu = document.getElementById('mode-dropdown-menu');

  const customLanguageDisplay = document.getElementById('custom-language-display');
  const customLanguageMenu = document.getElementById('custom-language-menu');
  const selectedLanguageText = document.getElementById('selected-language-text');

  function toggleDropdown(forceState) {
    if (forceState !== undefined) isDropdownOpen = forceState;
    else isDropdownOpen = !isDropdownOpen;
    if(modeDropdownMenu) {
      modeDropdownMenu.classList.toggle('hidden', !isDropdownOpen);
      modeDropdownMenu.classList.toggle('opacity-0', !isDropdownOpen);
    }
  }

  function toggleLanguageDropdown(forceState) {
    if (forceState !== undefined) isLanguageDropdownOpen = forceState;
    else isLanguageDropdownOpen = !isLanguageDropdownOpen;
    if(customLanguageMenu) {
      customLanguageMenu.classList.toggle('hidden', !isLanguageDropdownOpen);
      customLanguageMenu.classList.toggle('opacity-0', !isLanguageDropdownOpen);
    }
    if(customLanguageDisplay) {
      const icon = customLanguageDisplay.querySelector('i[data-lucide="chevron-down"]');
      if(icon) icon.classList.toggle('rotate-180', isLanguageDropdownOpen);
    }
  }

  function selectLanguage(lang) {
    if(selectedLanguageText) selectedLanguageText.textContent = lang;
    toggleLanguageDropdown(false);
  }

  if(customLanguageDisplay) {
    customLanguageDisplay.addEventListener('click', e => {
      e.stopPropagation();
      toggleLanguageDropdown();
    });
  }
  document.addEventListener('click', e => {
    if(isLanguageDropdownOpen && customLanguageDisplay && customLanguageMenu &&
       !customLanguageDisplay.contains(e.target) && !customLanguageMenu.contains(e.target)) {
      toggleLanguageDropdown(false);
    }
  });

  if(modeDropdownTrigger) {
    modeDropdownTrigger.addEventListener('click', e => {
      e.stopPropagation();
      toggleDropdown();
    });
  }
  document.addEventListener('click', e => {
    if(isDropdownOpen && modeDropdownTrigger && modeDropdownMenu &&
       !modeDropdownTrigger.contains(e.target) && !modeDropdownMenu.contains(e.target)) {
      toggleDropdown(false);
    }
  });
});
