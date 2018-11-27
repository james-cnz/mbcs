
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

let mbcs_user_query: string;

function mbcs_init(): void {

    // Get HTML elements
    mbcs_db_html            = document.querySelector("table#mbcs_db")               as HTMLTableElement;
    mbcs_input_query_html   = document.querySelector("input#mbcs_input_query_text") as HTMLInputElement;
    mbcs_input_submit_html  = document.querySelector("button#mbcs_input_submit")    as HTMLButtonElement;
    mbcs_error_html         = document.querySelector("span#mbcs_error_text")        as HTMLSpanElement;
    mbcs_results_html       = document.querySelector("ul#mbcs_results")             as HTMLUListElement;

    // Populate table with booksdb
    for (let book_index = 0; book_index < mbcs_booksdb.length; book_index++) {
        const book = mbcs_booksdb[book_index];
        const new_row = document.createElement("tr");
        new_row.innerHTML = "<td><a href=\"" + book.url + "\">" + book.title + "</a></td>";
        mbcs_db_html.appendChild(new_row);
    }

    // Listen to submit button
    mbcs_input_submit_html.addEventListener("click", mbcs_search);

}


async function mbcs_search(): Promise<void> {

    // Clear results list
    mbcs_results_html.innerHTML = "";

    // Get search string
    mbcs_user_query = mbcs_input_query_html.value;
    if (mbcs_user_query.length <= 0) {
        mbcs_error_html.innerHTML = "Required.";
        return;
    }

    for (let book_index = 0; book_index < mbcs_booksdb.length; book_index++) {
        const book_entry = mbcs_booksdb[book_index];

        // Fetch book page
        let text: string|null = null;
        try {
            const resp = await fetch(book_entry.url, {
                method:     "GET",
                mode:       "same-origin",
                credentials: "same-origin",
                redirect:   "follow",
                headers:    { "Content-Type": "text/html" }
            });
            if (resp.ok) {
                text = await resp.text();
            } else {
                console.error("Error while fetching: " + resp.statusText);
                mbcs_error_html.innerHTML = "An error occurred while fetching: " + book_entry.title;
            }
        } catch(err) {
            console.error("Error while fetching: " + err);
            mbcs_error_html.innerHTML = "An error occured while fetching: " + book_entry.title;
        }

        if (!text) { continue; }

        // Create HTML parser
        const parser = new DOMParser();

        // Parse book page
        const book_page = parser.parseFromString(text, "text/html");

        // Fetch table of contents
        const toc = book_page.querySelector(".book_toc_indented, .book_toc_none, .book_toc_numbered");

        // Create results line
        const results_title   = document.createElement("p");
        results_title.innerHTML = "Results for " + book_entry.title;
        const results_list    = document.createElement("ul");

        // Operate on direct <a> children of <li> (no actionbar items)
        const nodes = toc.querySelectorAll("li > a");
        for (let node_index = 0; node_index < nodes.length; node_index++) {
            const node = nodes[node_index];
            if ((node.textContent || "").toLowerCase().indexOf(mbcs_user_query.toLowerCase()) >= 0) {
                const title     = node.getAttribute("title");
                const href      = "https://moodle.op.ac.nz/mod/book/" + node.getAttribute("href");
                const list_item  = document.createElement("li");
                list_item.innerHTML = "<a href=\"" + href + "\">" + title + "</a>";
                results_list.appendChild(list_item);
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
