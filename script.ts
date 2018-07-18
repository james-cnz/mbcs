

const mbcs_booksdb = [
    {
        title: "Topics: Resources, Learning and Assessment Activities",
        url: "https://moodle.op.ac.nz/mod/book/view.php?id=516081"
    },
    {
        title: "Topics: Copyright and Open Educational Resources",
        url: "https://moodle.op.ac.nz/mod/book/view.php?id=510030"
    },
    {
        title: "Topics: Orientation and Assisting Students",
        url: "https://moodle.op.ac.nz/mod/book/view.php?id=509523"
    }
];

// HTML Elements

let mbcs_db_html:           HTMLTableElement;
let mbcs_input_query_html:  HTMLInputElement;
let mbcs_input_submit_html: HTMLButtonElement;
let mbcs_error_html:        HTMLSpanElement;
let mbcs_results_html:      HTMLUListElement;


async function mbcs_init(): Promise<void> {

    // Get HTML elements
    mbcs_db_html            = document.querySelector("table#mbcs_db")               as HTMLTableElement;
    mbcs_input_query_html   = document.querySelector("input#mbcs_input_query_text") as HTMLInputElement;
    mbcs_input_submit_html  = document.querySelector("button#mbcs_input_submit")    as HTMLButtonElement;
    mbcs_error_html         = document.querySelector("span#mbcs_error_text")        as HTMLSpanElement;
    mbcs_results_html       = document.querySelector("ul#mbcs_results")             as HTMLUListElement;

    // Populate table with booksdb
    for (const book of mbcs_booksdb) {
        const new_row = document.createElement("tr");
        new_row.innerHTML = "<td>" + "<a href='" + book.url + "'>" + book.title + "</a></td>";
        mbcs_db_html.appendChild(new_row);
    }

    // Listen to submit button
    mbcs_input_submit_html.addEventListener("click", mbcs_search);

}


async function mbcs_search(): Promise<void> {

    // Clear results list
    mbcs_results_html.innerHTML = "";

    // Get search string
    const userQuery = mbcs_input_query_html.value;
    if (userQuery.length > 0) { /*OK*/ } else {
        mbcs_error_html.innerHTML = "Required.";
        return;
    }

    // Create HTML parser
    const parser = new DOMParser();

    for (const book_entry of mbcs_booksdb) {

        // Fetch book page
        const book_response = await fetch(book_entry.url);
        if (book_response.ok) { /*OK*/ } else {
            // console.error("Error while fetching: " + book_response.statusText);
            mbcs_error_html.innerHTML = "An error occurred: " + book_response.statusText;
            continue;
        }

        // Parse book page
        const book_unparsed = await book_response.text();
        const book_page = parser.parseFromString(book_unparsed, "text/html");

        // Fetch table of contents
        const toc = book_page.querySelector(".book_toc_indented, .book_toc_none");

        // Create results line
        const results_title   = document.createElement("p");
        results_title.innerHTML = "Results for " + book_entry.title;
        const results_list    = document.createElement("ul");

        // console.log(userQuery);

        // Operate on direct <a> children of <li> (no actionbar items)
        for (const node of Object.values(toc.querySelectorAll(":scope li > a"))) {
            if ((node.textContent || "").includes(userQuery)) {
                const title     = node.getAttribute("title");
                const href      = "https://moodle.op.ac.nz/mod/book/" + node.getAttribute("href");
                const listItem  = document.createElement("li");
                listItem.innerHTML = "<a href='" + href + "'>" + title + "</a>";
                results_list.appendChild(listItem);
                // console.log("append");
            }
        }

        // Add results
        mbcs_results_html.appendChild(results_title);

        if (results_list.firstChild) {
            mbcs_results_html.appendChild(results_list);
        } else {
            const no_results_message = document.createElement("p");
            no_results_message.innerHTML = "No results found";
            mbcs_results_html.appendChild(no_results_message);
        }

    }
}


window.addEventListener("load", mbcs_init);
