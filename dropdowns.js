// ==== Mode & Language Dropdowns ====
let isDropdownOpen = false;
let isLanguageDropdownOpen = false;
document.addEventListener('DOMContentLoaded', () => {
    const modeDropdownTrigger = document.getElementById('mode-dropdown-trigger');
    const modeDropdownMenu = document.getElementById('mode-dropdown-menu');
    
    const customLanguageDisplay = document.getElementById('custom-language-display');
    const customLanguageMenu = document.getElementById('custom-language-menu');
    const selectedLanguageText = document.getElementById('selected-language-text');
    
    function toggleDropdown(forceState) {
        if(forceState!==undefined) isDropdownOpen = forceState;
        else isDropdownOpen = !isDropdownOpen;
        modeDropdownMenu.classList.toggle('hidden', !isDropdownOpen);
        modeDropdownMenu.classList.toggle('opacity-0', !isDropdownOpen);
    }
    
    function toggleLanguageDropdown(forceState) {
        if(forceState!==undefined) isLanguageDropdownOpen = forceState;
        else isLanguageDropdownOpen = !isLanguageDropdownOpen;
        customLanguageMenu.classList.toggle('hidden', !isLanguageDropdownOpen);
        customLanguageMenu.classList.toggle('opacity-0', !isLanguageDropdownOpen);
        const icon = customLanguageDisplay.querySelector('i[data-lucide="chevron-down"]');
        if(icon) icon.classList.toggle('rotate-180', isLanguageDropdownOpen);
    }
    
    function selectLanguage(lang){
        selectedLanguageText.textContent = lang;
        toggleLanguageDropdown(false);
    }

    // Listeners
    customLanguageDisplay.addEventListener('click', e => {
        e.stopPropagation();
        toggleLanguageDropdown();
    });
    document.addEventListener('click', e => {
        if(isLanguageDropdownOpen && !customLanguageDisplay.contains(e.target) && !customLanguageMenu.contains(e.target)){
            toggleLanguageDropdown(false);
        }
    });

    modeDropdownTrigger.addEventListener('click', e => {
        e.stopPropagation();
        toggleDropdown();
    });
    document.addEventListener('click', e => {
        if(isDropdownOpen && !modeDropdownTrigger.contains(e.target) && !modeDropdownMenu.contains(e.target)){
            toggleDropdown(false);
        }
    });
});
