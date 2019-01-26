import {
	Slickx
} from './slickx.js';

import {
	Jst
} from './jst.js';

$(document).ready(() => {
	const slickx = new Slickx(
		"#txtSearch",
		"#myGrid",
		"score",
		'#upbtn',
		'#downbtn',
		'#jquery-ui-autocomplete-input',
		'http://localhost:4567/xml/bookmarks_count',
		'http://localhost:4567/xml/bookmarks',
		'http://localhost:4567/xml/add_bookmark',
		'http://localhost:4567/xml/delete_bookmark'
	);
	// 'http://localhost:4567/xml/repos'

	//    var jst = new Jst( slickx , '#category-search' , '/xml/categories.json/2' );
	const jst = new Jst(slickx, '#category-search', '/xml/categories.json');
	//    var jst = new Jst( slickx , '#category-search' , '/xml/c.json/' );

	console.log("slickx.search_field=" + slickx.search_field);
});