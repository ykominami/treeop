import {
    RemoteModelBase
} from './slick.remotemodel-base.js';

export const RemoteModel = class extends RemoteModelBase {
    //    class RemoteModel extends RemoteModelBase {
    constructor(items_count_url, items_url, add_item_url, delete_item_url) {
        super(items_count_url, items_url, add_item_url, delete_item_url);
        this.data_count = [];
        this.data_addbookmark = [];
        this.data_deletebookmark = [];
        this.onAddBookmarkDataLoading = new Slick.Event();
        this.onAddBookmarkDataLoaded = new Slick.Event();
        this.onDeleteBookmarkDataLoading = new Slick.Event();
        this.onDeleteBookmarkDataLoaded = new Slick.Event();
    }

    deleteData(id) {
        console.log("deleteData");
        if (this.req) {
            this.req.abort();
            this.data = undefined;
        }

        const send_data = {
            id: id
        }
        if (this.h_request != null) {
            clearTimeout(this.h_request);
        }

        this.h_request = setTimeout( () => {
            //	    this.data = {length: 0};
            if (("data" in this) === false) {
                this.data = [];
            } else if (this.data === undefined) {
                this.data = [];
            }
            this.data[0] = null; // null indicates a 'requested but not available yet'

            this.req = $.ajax({
                data: send_data,
                //		type: "POST",
                type: "GET",
                url: this.delete_item_url,
                cache: true,
                success:  (data) => {
                    // this;
                    this.onDeleteBookmarkSuccess(data)
                },
                error:  (XMLHttpRequest, textStatus, errorThrown) => {
                    this.onDeleteBookmarkError()
                }
            });
        }, 50);
    }

    onDeleteBookmarkSuccess(json) {
        console.log("onDeleteBookmarkSuccess");
        console.log("json.length=" + json.length);
        if (json.length > 0) {
            //	if (json.count > 0) {
            const results = json
            const item = results[0];
            this.data[0] = {
                index: 0
            };
            this.data[0].id = item.id
        }
        this.req = null;
        this.onDeleteBookmarkDataLoaded.notify(this.data[0]);
    }

    onDeleteBookmarkError() {
        alert("onDeleteBookmarkError:error onDeleteBookmarkError");
    }

    addData(id, name, url, title, authors, add_date) {
        console.log("addData");

        if (this.category_id == null && this.path == null) {
            return;
        }

        if (this.req) {
            this.req.abort();
            this.data_addbookmark = undefined;
        }

        const send_data = {
            id: id,
            name: name,
            url: encodeURIComponent(url),
            title: title,
            authors: authors,
            add_date: add_date
        }

        if (this.category_id == null) {
            $.extend(send_data, {
                path: this.path
            });
        } else {
            $.extend(send_data, {
                category_id: this.category_id
            });
        }

        if (this.h_request != null) {
            clearTimeout(this.h_request);
        }
        this.h_request = setTimeout( () => {
            //	    this.data = {length: 0};
            if (("data" in this) === false) {
                this.data_addbookmark = [];
            } else if (this.data === undefined) {
                this.data_addbookmark = [];
            }
            this.data_addbookmark[0] = null; // null indicates a 'requested but not available yet'

            this.req = $.ajax({
                data: send_data,
                //		type: "POST",
                type: "GET",
                url: this.add_item_url,
                cache: true,
                success:  (data) => {
                    // this;
                    this.onAddBookmarkSuccess(data);
                },
                error:  (XMLHttpRequest, textStatus, errorThrown) => {
                    this.onAddBookmarkError(data);
                }
            });
        }, 50);
    }

    onAddBookmarkSuccess(json) {
        console.log("onAddBookmarkSuccess");
        console.log("json.length=" + json.length);
        if (json.length > 0) {
            //	if (json.count > 0) {
            const results = json
            this.data_addbookmark.length = results.length;
            for (let i = 0; i < results.length; i++) {
                console.log("i=" + i);
                const item = results[i];

                this.data[i] = {
                    index: i
                };
                Object.assign(this.data[i], item);
            }
        }
        this.req = null;

        this.onAddBookmarkDataLoaded.notify(this.data[0]);
    }

    onAddBookmarkError(json) {
        alert("Xml:onAddBookmarkError: onAddBookmarkError");
    }

    onSuccess(json, recStart) {
        console.log("onSuccess");
        console.log("json.length=" + json.length);
        console.log("recStart=" + recStart);
        let recEnd = recStart;
        if (json.length > 0) {
            //	if (json.count > 0) {
            const results = json;
            recEnd = recStart + results.length;
            this.data.length = Math.min(recEnd, 1000);
            for (let i = 0; i < results.length; i++) {
                console.log("i=" + i);
                const item = results[i];

                this.data[recStart + i] = {
                    index: recStart + i
                };
                Object.assign(this.data[recStart + i], item);
            }
        }
        this.req = null;

        this.onDataLoaded.notify({
            from: recStart,
            to: recEnd
        });
    }

    onError(fromPage, toPage) {
        alert("remotemodel-xml-b:onError: loading pages " + fromPage + " to " + toPage);
    }
}
