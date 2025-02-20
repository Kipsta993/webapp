document.querySelectorAll('.complete-btn').forEach(button => {
    button.addEventListener('click', function() {
        if (!this.classList.contains('completed')) {
            this.classList.add('completed');
        }
    });
}); 
