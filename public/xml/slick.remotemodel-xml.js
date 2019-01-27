import {
    RemoteModelBase
} from './slick.remotemodel-base.js';

export const RemoteModel = class extends RemoteModelBase {
    //    class RemoteModel extends RemoteModelBase {
    constructor(jQuery, items_count_url, items_url, add_item_url, delete_item_url) {
        super(jQuery, items_count_url, items_url, add_item_url, delete_item_url);
        //TODO: 取得したデータの持ち方が間違っていないか確認（現在のやり方では描画されないのではないか？）
        this.onAddBookmarkDataLoading = new Slick.Event();
        this.onAddBookmarkDataLoaded = new Slick.Event();
        this.onDeleteBookmarkDataLoading = new Slick.Event();
        this.onDeleteBookmarkDataLoaded = new Slick.Event();
    }

    deleteData(id) {
        const $ = this.jQuery;

        console.log("deleteData");
        const send_data = {
            id: id
        }
        //	    this.data = {length: 0};
        if (("data" in this) === false) {
            this.data = [];
        } else if (this.data === undefined) {
            this.data = [];
        }
        this.data[0] = null; // null indicates a 'requested but not available yet'

        this.onDeleteBookmarkDataLoading.notify({
            id: id
        });

        // ここはとりあえずfetchが使えることを確認するだけ
        // TOD: サーバ側処理も含めてdelete処理を実装する
        fetch( this.delete_item_url )
        .then( response => { return response.json() })
        .then( json => {
            console.log( "delete" )
            this.onDeleteBookmarkDataLoaded.notify({
                id: id
            });
        })
        .catch( error => {
            console.log(error)
            this.onDeleteBookmarkDataLoaded.notify({
                id: id
            });
        })
    }

    addData(id, name, url, title, authors, add_date) {
        const $ = this.jQuery;

        console.log("addData");
        //TODO: メソッドの引数以外に、プロパティが設定されていることを前提にしている。よくないAPI仕様である。
        if (this.category_id == null && this.path == null) {
            return;
        }

        if (this.req) {
            this.req.abort();
            this.data = undefined;
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

        //	    this.data = {length: 0};
        if (("data" in this) === false) {
            this.data = [];
        } else if (this.data === undefined) {
            this.data = [];
        }
        this.data[0] = null; // null indicates a 'requested but not available yet'
        this.onAddBookmarkDataLoading.notify({
            id: id
        });

        // ここはとりあえずfetchが使えることを確認するだけ
        // TOD: サーバ側処理も含めてadd処理を実装する
        fetch(this.add_item_url)
        .then(response => {
            return response.json()
        })
        .then(json => {
            console.log("add")
            if (json.length > 0) {
                //	if (json.count > 0) {
                const results = json
                this.data.length = results.length;
                for (let i = 0; i < results.length; i++) {
                    console.log("i=" + i);
                    const item = results[i];

                    Object.assign(this.data[i], item);
                    this.data[i] = {
                        index: i
                    };
                }
            }
            this.onAddBookmarkDataLoaded.notify({
                id: id
            });
        })
        .catch(error => {
            console.log(error)
            this.onAddBookmarkDataLoaded.notify({
                id: id
            });
        })
    }
}
