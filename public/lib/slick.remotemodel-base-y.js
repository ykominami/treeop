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
			var PAGESIZE = 30;
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
			for (var i = from; i <= to; i++) {
				if (this.data[i] == undefined || this.data[i] == null) {
					return false;
				}
			}

			return true;
		}

		clear() {
			for (var key in this.data) {
				delete this.data[key];
			}
			this.data.length = 0;
		}

		getDataCount() {
			if (this.req) {
				this.req.abort();
				this.data_row[0] = undefined;
			}

			var url = null;
			var path = this.searchstr;
			var int_val = parseInt(path, 10);
			if (isNaN(int_val)) {
				url = this.items_count_url + "?path=" + path;
				this.path = path;
				this.category_id = null;
			} else {
				url = this.items_count_url + "?category_id=" + int_val;
				this.path = null;
				this.category_id = int_val;
			}
			if (this.h_request != null) {
				clearTimeout(this.h_request);
			}
			console.log("getDataCount:");
			var self = this;
			this.h_request = setTimeout(function () {
				self.data_row[0] = null; // null indicates a 'requested but not available yet'
				console.log("jsonp 2 " + url);
				self.req = $.jsonp({
					url: url,
					callbackParameter: "callback",
					cache: true,
					success: function (json, textStatus, xOptions) {
						self.onSuccessCount(json)
					},
					error: function () {
						self.onErrorCount()
					}
				});
			}, 50);
		}

		ensureData(from, to) {
			console.log("ensureData");
			if (this.req) {
				this.req.abort();
				for (var i = this.req.fromPage; i <= this.req.toPage; i++) {
					this.data[i * this.PAGESIZE] = undefined;
				}
			}

			if (from < 0) {
				from = 0;
			}

			if (this.data.length > 0) {
				to = Math.min(to, this.data.length - 1);
			}

			var fromPage = Math.floor(from / this.PAGESIZE);
			var toPage = Math.floor(to / this.PAGESIZE);

			while (this.data[fromPage * this.PAGESIZE] !== undefined && fromPage < toPage)
				fromPage++;

			while (this.data[toPage * this.PAGESIZE] !== undefined && fromPage < toPage)
				toPage--;

			if (fromPage > toPage || ((fromPage == toPage) && this.data[fromPage * this.PAGESIZE] !== undefined)) {
				// TODO:  look-ahead
				this.onDataLoaded.notify({
					from: from,
					to: to
				});
				return;
			}

			var recStart = (fromPage * this.PAGESIZE);
			var recCount = (((toPage - fromPage) * this.PAGESIZE) + this.PAGESIZE);

			//      this.url = "/ev/repos?path=" + searchstr ;
			//      this.url = "http://localhost:4567/ev/repos?path=" + searchstr ;
			var url = null;
			var path = this.searchstr;
			var int_val = parseInt(path, 10);
			if (isNaN(int_val)) {
				url = this.items_url + "?path=" + path + "&start=" + recStart + "&limit=" + recCount;
				this.path = path;
				this.category_id = null;
			} else {
				url = this.items_url + "?category_id=" + int_val + "&start=" + recStart + "&limit=" + recCount;
				this.path = null;
				this.category_id = int_val;
			}

			if (this.h_request != null) {
				clearTimeout(this.h_request);
			}
			var self = this;
			this.h_request = setTimeout(function () {
				for (var i = fromPage; i <= toPage; i++)
					self.data[i * self.PAGESIZE] = null; // null indicates a 'requested but not available yet'

				self.onDataLoading.notify({
					from: from,
					to: to
				});
				console.log("jsonp 1 url=" + url);
				self.req = $.jsonp({
					url: url,
					callbackParameter: "callback",
					cache: true,
					success: function (json, textStatus, xOptions) {
						console.log("success");
						self.onSuccess(json, recStart)
					},
					error: function () {
						console.log("error");
						self.onError(fromPage, toPage)
					}
				});

				self.req.fromPage = fromPage;
				self.req.toPage = toPage;
			}, 50);
		}

		onError(fromPage, toPage) {
			alert("Base:error loading pages " + fromPage + " to " + toPage);
		}

		onSuccess(json, recStart) {}

		onErrorCount() {
			alert("Base:error loading pages ");
		}

		onSuccessCount(json) {
			console.log("onSuccessCount: 0");
			if (json.length > 0) {
				//	if (json.count > 0) {
				var results = json
				//data.length = 100;
				//data.length = Math.min(parseInt(results.length),1000); // limitation of the API
				this.data_row.length = 1;
				this.data_row[0] = {
					count: results[0].count
				};
				console.log("onSuccessCount: 1|" + this.data_row[0].count);
			}
			this.req = null;

			this.onCountDataLoaded.notify({
				count: results[0].count
			});
		}

		reloadData(from, to) {
			for (var i = from; i <= to; i++)
				delete this.data[i];

			this.ensureData(from, to);
		}

		setSort(column, dir) {
			this.sortcol = column;
			this.sortdir = dir;
			this.clear();
		}

		setSearch(str) {
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