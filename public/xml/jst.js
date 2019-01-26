export const Jst = class {
    constructor(slickx, search_field, category_url) {
        this.slickx = slickx;
        this.search_field = search_field;

        this.to = false;

        this.jst = $("#jstree").jstree({
            'core': {
                'check_callback': (operation, node, node_parent, node_position, more) => {
                    // operation can be 'create_node', 'rename_node', 'delete_node', 'move_node' or 'copy_node'
                    // in case of 'rename_node' node_position is filled with the new node name
                    //	return operation === 'rename_node' ? true : false;
                    //		var ret = false;
                    var ret = true;
                    return ret;
                },
                'multiple': false,
                'error': () => {
                    console.log("error");
                },
                'themes': {
                    // default 'expand_selected_onload' : true,
                    // default 'workder' : true,
                    // default 'force_text' : false,
                    // default 'dbclick_toggle' : true,
                    'icons': false,
                    'stripes': true,
                    'responsive': true
                },

                "data": {
                    "url": category_url,
                    'dataType': "json"
                },

                "state": {
                    "key": "git-git"
                },
                "plugins": ["dnd", "contextmenu", "search", "state", "wholerow"]
            }
        });
        this.jst.on('select_node.jstree', (e, data) => {
            console.log("select_node");
            /*
            var node = data.instance.get_node(data.selected[0])
            var path = data.instance.get_path(data.selected[0], '/', false);
            var next_dom = data.instance.get_next_dom(data.selected[0], true);
            var prev_dom = data.instance.get_prev_dom(data.selected[0], true);
            var json = data.instance.get_json(data.selected[0], true);
            */
            const inst = data.instance.get_node(data.selected[0])
            if (inst !== null) {
                const category_id = inst.id;
                console.log("on select_node.jstree category_id= " + category_id)
                this.slickx.do_search(category_id);
            }
        });

        this.jst.on('move_node.jstree', (e, n) => {
            console.log("# move_node");
            console.log("n.parent=" + n.parent);
            console.log("n.position=" + n.position);
            console.log("n.old_parent=" + n.old_parent);
            console.log("n.old_position=" + n.old_position);
            console.log("n.is_multi=" + n.multi);
        });

        this.jst.on('dnd_scroll.vakata', (node) => {
            console.log("dnd_scroll.vakata");
        });
        this.jst.on('dnd_start.vakata', (node) => {
            console.log("dnd_start.vakata");
        });
        this.jst.on('dnd_move.vakata', (node) => {
            console.log("dnd_move.vakata");
        });

        $(document).on('dnd_end.vakata', (node) => {
            console.log("dnd_end.vakata");
        });
        this.jst.on('model.jstree', (nodes, parent) => {
            console.log("model");
        });
        this.jst.on('activate_node.jstree', (node) => {
            console.log("active_node");
        });
        this.jst.on('copy_node.jstree', (node) => {
            console.log("copy_node");
        });
        this.jst.on('changed.jstree', (node, action, selected, event) => {
            console.log("changed");
        });
        this.jst.on('deselect_node.jstree', (node, selected, event) => {
            console.log("deselect_node");
        });
        this.jst.on('cut.jstree', (node) => {
            console.log("cut");
        });
        this.jst.on('copy.jstree', (node) => {
            console.log("copy");
        });
        this.jst.on('paste.jstree', (node) => {
            console.log("paste");
        });
        this.jst.on('edit.jstree', (node) => {
            console.log("edit");
        });

        $( // TODO:
            this.search_field).keyup(() => {
            if (this.to) {
                clearTimeout(this.to);
            }
            this.to = setTimeout(() => {
                let v = $('#category-search').val();
                //console.log( v );
                // console.log( jst );
                if (typeof v === 'undefined') {
                    v = "0";
                }
                $('#jstree').jstree(true).search(v);
            }, 250);
        });
    }
}
