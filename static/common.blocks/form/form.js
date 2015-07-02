modules.define('form', ['i-bem__dom', 'jquery', 'button'], function(provide, BEMDOM, $, Button) {

provide(BEMDOM.decl(this.name, {
    onSetMod: {
        js: {
            inited: function() {
                var checkboxes = this.findBlocksInside('checkbox'),
                    spin = this.findBlockInside('spin'),
                    $result = this.elem('result');

                Button.on(this.elem('toggle'), 'click', function() {
                    checkboxes.forEach(function(checkbox) {
                        checkbox.toggleMod('checked');
                    });
                });

                this.bindTo('submit', function(e) {
                    e.preventDefault();

                    var query = this.domElem.serialize();

                    spin.setMod('visible');

                    $.get('/?' + query).then(function(data) {
                        BEMDOM.update($result, data);
                        spin.delMod('visible');
                    }).fail(function() {
                        spin.delMod('visible');
                    });
                });
            }
        }
    }
}));

});
