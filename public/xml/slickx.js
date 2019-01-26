import {
    RemoteModel
} from './slick.remotemodel-xml.js';

export const Slickx = class {
    constructor(search_field, sgrid, score, upbtn, downbtn, acinput, items_count_url, items_url, add_item_url, delete_item_url) {
        this.selected_cell_row = null;
        this.selectedRow = null;
        this.search_field = search_field;
        this.sgrid = sgrid;
        this.score = score;
        this.upbtn = upbtn;
        this.downbtn = downbtn;
        this.acinput = acinput;

        //    var s;
        this.text_ // FIXME: eld = search_field;
        this.score = score;
        this.page_num = 0;
        this.page_size = 0;
        this.columns = [
            //        {id: "mpn", name: "name", field: "name", formatter: mpnFormatter, width: 100, sortable: true },
            //        {id: "id", name: "id", field: "id", formatter: brandFormatter, width: 100, sortable: true },
            {
                id: "name",
                name: "name",
                field: "name",
                width: 200,
                editor: Slick.Editors.Text
            },
            {
                id: "id",
                name: "id",
                field: "id",
                width: 80
            },
            {
                id: "url",
                name: "Url",
                field: "url",
                width: 300,
                editor: Slick.Editors.Text
            },
            {
                id: "title",
                name: "書名",
                field: "title",
                width: 100,
                editor: Slick.Editors.Text
            },
            {
                id: "authors",
                name: "著者",
                field: "authors",
                width: 100,
                editor: Slick.Editors.Text
            },
        ];
        this.options = {
            rowHeight: 21,
            editable: true,
            enableAddRow: true,
            enableCellNavigation: true,
            asyncEditorLoading: false,
            autoEdit: false,
            //	editCommandHandler: queueAndExecuteCommand
        };

        this.loadingIndicator = null;

        this.dataView = new Slick.Data.DataView();

        this.loader = new RemoteModel(items_count_url, items_url, add_item_url, delete_item_url);

        this.grid = new Slick.Grid(this.sgrid, this.dataView, this.columns, this.options);

        this.grid.setSelectionModel(new Slick.CellSelectionModel());

        this.dataView.setItems(this.loader.data);
        this.dataView.onRowCountChanged.subscribe((e, args) => {
            console.log("onRowCountChanged");
            this.grid.updateRowCount();
            this.grid.render();
        });
        this.dataView.onRowsChanged.subscribe((e, args) => {
            console.log("onRowsChanged");
            this.grid.invalidateRows(args.rows);
            this.grid.render();
        });


        this.grid.onAddNewRow.subscribe((e, args) => {
            console.log("onAddNewRow");
            this.updateRow(args.item);
        });
        this.grid.onCellChange.subscribe((e, args) => {
            console.log("onCellChange");
        });
        this.grid.onSelectedRowsChanged.subscribe((e) => {
            console.log("onSelectedRowsChanged");
        });
        this.grid.onContextMenu.subscribe((e) => {
            console.log("onContextMenu");
            console.log(e.pageY);
            console.log(e.pageX);
            e.preventDefault();
            const selected_cell = this.grid.getCellFromEvent(e);
            this.selected_cell_row = selected_cell.row;
            //	    var selectedRowIds = this.dataView.mapRowsToIds(this.grid.getSelectedRows());
            const selectedRowIds = this.dataView.mapRowsToIds([selected_cell.row]);
            this.selectedRow = selectedRowIds[0];
            $("#contextMenu")
                .css("top", e.pageY)
                .css("left", e.pageX)
                .show();
            $("body").one("click", () => {
                $("#contextMenu").hide();
            });
        });

        $("#contextMenu").click((e) => {
            if (!$(e.target).is("li")) {
                return;
            }
            if (!this.grid.getEditorLock().commitCurrentEdit()) {
                return;
            }
            console.log(e.target.id);
            if (e.target.id == "Delete") {
                console.log(this.selectedRow);
                this.data = this.dataView.getItem(this.selected_cell_row);
                this.dataView.deleteItem(this.selectedRow);
                this.loader.deleteData(this.data.id);
            } else if (e.target.id == "Open") {
                console.log(this.selectedRow);
                this.data = this.dataView.getItem(this.selected_cell_row);
                const childWindow = window.open('about:blank');
                childWindow.location.href = this.data.url;
                childWindow = null;
            }
        });

        this.loader.onDataLoading.subscribe(() => {
            console.log("onDataLoading");
            if (!this.loadingIndicator) {
                this.loadingIndicator = $("<span class='loading-indicator'><label>Buffering...</label></span>").appendTo(document.body);
                const $g = $(sgrid);
                this.loadingIndicator
                    .css("position", "absolute")
                    .css("top", $g.position().top + $g.height() / 2 - this.loadingIndicator.height() / 2)
                    .css("left", $g.position().left + $g.width() / 2 - this.loadingIndicator.width() / 2);
            }
            this.loadingIndicator.show();
        });

        this.loader.onDataLoaded.subscribe((e, args) => {
            console.log("onDataLoaded");
            this.dataView.setItems(this.loader.data);
            /*
		for (var i = args.from; i <= args.to; i++) {
		this.grid.invalidateRow(i);
		}
		this.grid.updateRowCount();
		this.grid.render();
	    */
            this.loadingIndicator.fadeOut();
        });
        this.loader.onCountDataLoaded.subscribe((e, args) => {
            console.log("onCountDataLoaded=" + args.count);
            this.loader.ensureData(0, args.count);
        });
        this.loader.onAddBookmarkDataLoaded.subscribe((e, args) => {
            console.log("onAddBookmarkDataLoaded=" + args.original_id);
            //            this.loader.ensureData( 0 , args.length);
            if (args.original_id == "") {
                console.log("onAddBookmarkDataLoaded 1 =" + args.original_id);
                this.dataView.addItem({
                    "id": args["id"],
                    "name": args["name"],
                    "title": args["title"],
                    "authors": args["authors"],
                    "url": args["url"]
                });
            } else {
                if (args.original_id != args.id) {
                    console.log("onAddBookmarkDataLoaded 21 =" + args.original_id);
                    this.dataView.deleteItem(args.original_id);
                    this.dataView.addItem({
                        "id": args["id"],
                        "name": args["name"],
                        "title": args["title"],
                        "authors": args["authors"],
                        "url": args["url"]
                    });
                } else {
                    console.log("onAddBookmarkDataLoaded 22 =" + args.original_id);
                }
            }
        });

        this.loader.onDeleteBookmarkDataLoaded.subscribe((e, args) => {
            console.log("onDeleteBookmarkDataLoaded=" + args.id);
        });

        $(this.text_field).keyup((e) => {
            // pushed Enter key
            if (e.which == 13) {
                //				this.do_search($(this).val());
                const kv = $(this.text_field).val()
                console.log("Call do_search|this.text_field=" + kv)
                this.do_search(kv);
            }
        });
        let kv = $(this.text_field).val()
        if (typeof kv === 'undefined') {
            kv = "";
        }
        console.log("kv=" + kv)
        this.loader.setSearch(kv);
        this.loader.setSort(this.score, -1);
        this.grid.setSortColumn(this.score, false);
        // load the first page
        //    this.grid.onViewportChanged.notify();

        $(this.upbtn).click(() => {
            this.page_num = this.page_num + 1;
            const category_id = $("#txtSearch").val();
            console.log("this.upbtn call do_search category_id=" + category_id)
            do_search(category_id);
        });
        $(this.downbtn).click(() => {
            if (this.page_num > 0) {
                this.page_num = this.page_num - 1;
            }
            const category_id = $("#txtSearch").val();
            console.log("this.downbtn call do_search category_id=" + category_id)
            do_search(category_id);
        });

        // AutoComplete
        $(this.acinput).autocomplete({
                source: (request, res) => {
                    $.ajax({
                        url: "/xml/api",
                        type: "POST",
                        cache: false,
                        dataType: "json",
                        data: {
                            q: request.term
                        },
                        success: (o) => {
                            res(o);
                        },
                        error: (xhr, ts, err) => {
                            res(['']);
                        }
                    });
                },
                search: (event, ui) => {
                    if (event.keyCode == 229) return false;
                    return true;
                },
                open: () => {
                    $(this).removeClass("ui-corner-all");
                }
            })
            .keyup((event) => {
                if (event.keyCode == 13) {
                    $(this).autocomplete('#jquery-ui-autocomplete-input');
                }
            });
    }


    updateRow(item) {
        const name = item["name"];
        const url = item["url"];
        const title = item["title"];
        const authors = item["authors"];
        console.log("id=" + item["id"]);
        console.log("name=" + item["name"]);
        console.log("url=" + item["url"]);
        console.log("title=" + item["title"]);
        console.log("authors=" + item["authors"]);

        console.log("onAddNewRow 2");
        this.grid.invalidateRow(this.loader.data.length);
        if (name == null) {
            name = "";
        }
        if (url == null) {
            url = "";
        }
        if (title == null) {
            title = "";
        }
        if (authors == null) {
            authors = "";
        }
        if (item["id"] === void 0) {
            this.loader.addData("", name, url, title, authors, Math.trunc(Date.now() / 1000));
        } else {
            this.dataView.addItem(item);
            this.dataView.syncGridSelection(this.grid, true, true);
            this.grid.updateRowCount();
            this.grid.render();
            this.loader.addData(item["id"], name, url, title, authors, Math.trunc(Date.now() / 1000));
        }
    }

    redraw_viewport() {
        const vp = this.grid.getViewport();
        const from = vp.top;
        const to = vp.bottom;
        if (this.page_size == 0) {
            this.page_size = to - from + 1;
        }
        const fromx = 0;
        const tox = (this.page_size * (this.page_num + 1));
        console.log("fromx=" + fromx);
        console.log("tox=" + tox);
        this.loader.getDataCount();
    }

    do_search(category_id) {
        console.log("do_search category_id=" + category_id)
        console.log("do_search this.loader=" + this.loader)
        $(this.text_field).val(category_id);
        this.loader.setSearch(category_id);
        this.redraw_viewport();
        //    redraw_viewport();
    }
}
