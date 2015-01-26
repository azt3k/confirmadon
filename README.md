confirmadon
========

A client site / ajax (backend agnostic) pagination system

### Basic Usage

````html
<a href="?remove=1" class="remove">Remove Me</a>
````

````javascript
$('.remove').confirmadon();
````


### Options / Defaults


````json
defaults = {
    bindTo: null,
    replacements: {
        message: 'Are you sure you want to perform this action?',
        yes: 'Yes',
        no: 'No'
    },
    template:   '<div class="confirmadon-wrap" style="background:rgba(0,0,0,0.5); position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 20000;">'+
                    '<div class="confirmadon-modal" style="padding:20px; background:#fff; position: fixed; top: 50%; left: 50%; width: 240px; height: 140px; margin-top: -70px; margin left: -120px; z-index: 20001;">' +
                        '<p>{{message}}</p><a class="confirmadon-yes" href="">{{yes}}</a><a class="confirmadon-no" href="">{{no}}</a>' +
                    '</div>' +
                '</div>',
    noSelector: '.confirmadon-no',
    yesSelector: '.confirmadon-yes',
    visibleClass: 'confirmadon-visible',
    onBeforeDisplay: null, // ()
    onAfterDisplay: null,  // ()
    onAfterConfirm: null,  // ()
    onAfterDeny: null,     // ()
    fade: true,
    applyDefaultOnConfirm: true
};
````

### Todo

- Finish docs
- Make more examples
- look at ordering of events - maybe use native events in order to ensure it fires before jquery handlers