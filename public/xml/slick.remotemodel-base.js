export const RemoteModelBase = class {
    constructor(jQuery, item_count_url, item_url, add_item_url, delete_item_url) {
        this.jQuery = jQuery;
        const $ = this.jQuery;
        // private
        this.PAGESIZE = 30;
        this.category_id = null;
        this.path = null;
        //	this.data = {length: 0};
        this.data = [];
        this.data_row = {
            length: 0
        };
        this.searchstr = "";
        this.sortcol = null;
        this.sortdir = 1;

        // events
        this.onDataLoading = new Slick.Event();
        this.onDataLoaded = new Slick.Event();
        this.onCountDataLoaded = new Slick.Event();

        // variables
        this.item_count_url = item_count_url;
        this.item_url = item_url;
        this.add_item_url = add_item_url;
        this.delete_item_url = delete_item_url;

        // initialize method
        this.init();
    }
    // do nothing
    init() {}

    // 未利用のメソッド
    isDataLoaded(from, to) {
        for (let i = from; i <= to; i++) {
            if (this.data[i] == undefined || this.data[i] == null) {
                return false;
            }
        }

        return true;
    }

    clear() {
        for (let key in this.data) {
            delete this.data[key];
        }
        this.data.length = 0;
    }

    getDataCount() {
        let url = null;
        const path = this.searchstr;
        const int_val = parseInt(path, 10);
        if (isNaN(int_val)) {
            url = `${this.item_count_url}?path=${path}`;
            this.path = path;
            this.category_id = null;
        } else {
            url = `${this.item_count_url}?category_id=${int_val}`;
            this.path = null;
            this.category_id = int_val;
        }
        console.log("getDataCount:");
        this.onDataLoading.notify({
        });
        fetch(url).then( response  => {
            return response.json();
        } )
        .then( (json) => {
            var count = 0;
            console.log(`then:${json}`);
            if (json.length > 0) {
                //	if (json.count > 0) {
                const results = json
                //data.length = 100;
                //data.length = Math.min(parseInt(results.length),1000); // limitation of the API
                count = results[0].count
                this.data_row.length = 1;
                this.data_row[0] = {
                    count: count
                };
                console.log(`onSuccessCount: 1|${this.data_row[0].count}`);
            }
            this.onCountDataLoaded.notify({
                count: count
            });
        }).catch( error => {
            console.log( error )
            this.onCountDataLoaded.notify({
                count: 0
            });
            //alert('remotemodel-base:onErrorCount:error loading');
        } )
    }
    ensureData(from, to) {
        console.log("ensureData");
        console.log(`from=${from}`);
        console.log(`to=${to}`);
        console.log(`this.PAGESIZE=${this.PAGESIZE}`);

        if (from < 0) {
            from = 0;
        }

        if (this.data.length > 0) {
            to = Math.min(to, this.data.length - 1);
        }
        console.log(`to=${to}`);

        let fromPage = Math.trunc(from / this.PAGESIZE);
        let toPage = Math.trunc(to / this.PAGESIZE);
        console.log(`fromPage=${fromPage}`);
        console.log(`toPage=${toPage}`);

        while (this.data[fromPage * this.PAGESIZE] !== undefined && fromPage < toPage) {
            fromPage++;
        }

        while (this.data[toPage * this.PAGESIZE] !== undefined && fromPage < toPage) {
            toPage--;
        }

        if (fromPage > toPage || ((fromPage == toPage) && this.data[fromPage * this.PAGESIZE] !== undefined)) {
            // TODO:  look-ahead
            //this.from_ = from;
            //this.to_ = to;
            this.onDataLoaded.notify({
                from: from,
                to: to
            });
            return;
        }

        const recStart = (fromPage * this.PAGESIZE);
        const recCount = (((toPage - fromPage) * this.PAGESIZE) + this.PAGESIZE);

        //      this.url = "/ev/repos?path=" + searchstr ;
        //      this.url = "http://localhost:4567/ev/repos?path=" + searchstr ;
        let part = null;
        const path = this.searchstr;
        const int_val = parseInt(path, 10);
        if (isNaN(int_val)) {
            part = `path=${path}`;
            this.path = path;
            this.category_id = null;
        } else {
            part = `category_id=${int_val}`;
            this.path = null;
            this.category_id = int_val;
        }
        const url = `${this.item_url}?${part}&start=${recStart}&limit=${recCount}`;

        for (let i = fromPage; i <= toPage; i++) {
            this.data[i * this.PAGESIZE] = null; // null indicates a 'requested but not available yet'
        }

        this.onDataLoading.notify({
            from: from,
            to: to
        });
        console.log(`jsonp 1 url=${url}`);
        fetch(url).then(response => {
            return response.json();
        })
        .then((json) => {
            for (let i = 0; i < json.length; i++) {
                const item = json[i];
                this.data[from + i] = item;
                this.data[from + i].index = from + i;
            }
            console.log(`onSuccess`);
            this.onDataLoaded.notify({
                from: from,
                to: to
            });
        }).catch(error => {
            console.log(error)
            this.onDataLoaded.notify({
                from: from,
                to: to
            });
            alert(`remotemodel-base:onError:error loading pages ${fromPage} to ${toPage}`);
        })
    }

    reloadData(from, to) {
        for (let i = from; i <= to; i++) {
            delete this.data[i];
        }

        this.ensureData(from, to);
    }

    setSort(column, dir) {
        this.sortcol = column;
        this.sortdir = dir;
        this.clear();
    }

    setSearch(str) {
        if (typeof str === 'undefined') {
            str = "";
        }
        console.log(`setSearch str=${str}`)
        this.searchstr = str;
        this.clear();
    }

}