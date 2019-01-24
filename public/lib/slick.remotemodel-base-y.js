(function ($) {
	/***
	 * A sample AJAX data store implementation.
	 * Right now, it's hooked up to load search results from Octopart, but can
	 * easily be extended to support any JSONP-compatible backend that accepts paging parameters.
	 */
	/**/
	class RemoteModelBase {
		constructor(items_count_url, items_url, add_item_url) {
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
			this.h_request = null;
			this.req = null; // ajax request

			// events
			this.onDataLoading = new Slick.Event();
			this.onDataLoaded = new Slick.Event();
			this.onCountDataLoaded = new Slick.Event();

			// variables
			this.items_count_url = items_count_url;
			this.items_url = items_url;
			this.add_item_url = add_item_url;

			// initialize method
			this.init();
		}

		init() {}

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
			if (this.req) {
				this.req.abort();
				this.data_row[0] = undefined;
			}

			let url = null;
			const path = this.searchstr;
			console.log(`getDataCount path=${path}`)
			const int_val = parseInt(path, 10);
			if (isNaN(int_val)) {
				url = `${this.items_count_url}?path=${path}`;
				this.path = path;
				this.category_id = null;
			} else {
				url = `${this.items_count_url}?category_id=${int_val}`;
				this.path = null;
				this.category_id = int_val;
			}
			if (this.h_request != null) {
				clearTimeout(this.h_request);
			}
			console.log("getDataCount:");
			this.h_request = setTimeout( () => {
				this.data_row[0] = null; // null indicates a 'requested but not available yet'
				console.log(`jsonp 2 ${url}`);
				this.req = $.jsonp({
					url: url,
					callbackParameter: "callback",
					cache: true,
					success:  (json, textStatus, xOptions) => {
						this.onSuccessCount(json)
					},
					error:  (xOptions, textStatus) => {
						this.onErrorCount(xOptions, textStatus)
					}
				});
			}, 50);
		}

		ensureData(from, to) {
			console.log("ensureData");
			console.log(`from=${from}`);
			console.log(`to=${to}`);
			console.log(`this.PAGESIZE=${this.PAGESIZE}`);
			if (this.req) {
				this.req.abort();
				for (let i = this.req.fromPage; i <= this.req.toPage; i++) {
					this.data[i * this.PAGESIZE] = undefined;
				}
			}

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

			while (this.data[fromPage * this.PAGESIZE] !== undefined && fromPage < toPage){
				fromPage++;
			}

			while (this.data[toPage * this.PAGESIZE] !== undefined && fromPage < toPage){
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
			const	url = `${this.items_url}?${part}&start=${recStart}&limit=${recCount}`;

			if (this.h_request != null) {
				clearTimeout(this.h_request);
			}
			this.h_request = setTimeout( () => {
				for (let i = fromPage; i <= toPage; i++){
					this.data[i * this.PAGESIZE] = null; // null indicates a 'requested but not available yet'
				}

				this.onDataLoading.notify({
					from: from,
					to: to
				});
				console.log(`jsonp 1 url=${url}`);
				this.req = $.jsonp({
					url: url,
					callbackParameter: "callback",
					cache: true,
					success:  (json, textStatus, xOptions) => {
						console.log("success");
						this.onSuccess(json, recStart)
					},
					error:  (textStatus, xOptions) => {
						console.log("error");
						this.onError(fromPage, toPage)
					}
				});

				this.req.fromPage = fromPage;
				this.req.toPage = toPage;
			}, 50);
		}

		onError(fromPage, toPage) {
			alert(`remotemodel-base:onError:error loading pages ${fromPage} to ${toPage}`);
		}

		onSuccess(json, recStart) {}

		onErrorCount(xOptions, textStatus) {
			console.log( xOptions )
			console.log( textStatus )
			alert('remotemodel-base:onErrorCount:error loading' );
		}

		onSuccessCount(json) {
			let results;

			console.log("onSuccessCount: 0");
			if (json.length > 0) {
				//	if (json.count > 0) {
				results = json
				//data.length = 100;
				//data.length = Math.min(parseInt(results.length),1000); // limitation of the API
				this.data_row.length = 1;
				this.data_row[0] = {
					count: results[0].count
				};
				console.log(`onSuccessCount: 1|${this.data_row[0].count}` );
			}
			this.req = null;

			this.onCountDataLoaded.notify({
				count: results[0].count
			});
		}

		reloadData(from, to) {
			for (let i = from; i <= to; i++){
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
			if (typeof str === 'undefined'){
				str = "";
			}
			console.log(`setSearch str=${str}`)
			this.searchstr = str;
			this.clear();
		}

	}

	// Slick.Data.RemoteModel
	$.extend(true, window, {
		Slick: {
			Data: {
				RemoteModelBase: RemoteModelBase
			}
		}
	});
})(jQuery);