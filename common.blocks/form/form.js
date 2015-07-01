modules.define('form', ['i-bem__dom', 'button'], function(provide, BEMDOM, Button) {

provide(BEMDOM.decl(this.name, {
    onSetMod: {
        js: {
            inited: function() {
                var checkboxes = this.findBlocksInside('checkbox');

                Button.on(this.elem('toggle'), 'click', function() {
                    checkboxes.forEach(function(checkbox) {
                        checkbox.toggleMod('checked');
                    });
                });
            }
        }
    }
}));

});
