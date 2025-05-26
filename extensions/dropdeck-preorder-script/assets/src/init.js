export function initializeDropdeckPreorder() {
    if (!window.dropdeckPreorderInit) {
        window.dropdeckPreorderInit = function () {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('Dropdeck preorder script initialized');
            });
            window.dropdeckPreorderInit = function () {
                console.log('Dropdeck preorder already initialized');
            };
        };
    }
    window.dropdeckPreorderInit();
}
