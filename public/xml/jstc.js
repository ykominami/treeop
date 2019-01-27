import {
	Slickx
} from './slickx.js';

import {
	Jst
} from './jst.js';

$(document).ready(() => {
	const slickx = new Slickx(
		jQuery,
		"#txtSearch",
		"#myGrid",
		"score",
		'#upbtn',
		'#downbtn',
		'#jquery-ui-autocomplete-input',
		'/xml/bookmarks_count_json',
		'/xml/bookmarks_json',
		'/xml/add_bookmark',
		'/xml/delete_bookmark'
	);
	const category_url = '/xml/categories.json'
	const jst = new Jst(jQuery, slickx, '#category-search', category_url);

	console.log("slickx.search_field=" + slickx.search_field);
});