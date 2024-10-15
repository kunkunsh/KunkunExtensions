import {
	Action,
	expose,
	Icon,
	IconEnum,
	List,
	Form,
	db,
	open,
	fetch,
	toast,
	ui,
	WorkerExtension
} from "@kksh/api/ui/worker"

import {
	generalActions, 
	friendsActions, 
	userActions, 
	specialActions
} from "./actions"

const LETTERBOXD_URL = "https://letterboxd.com"
const LETTERBOXD_TMDB_URL = `${LETTERBOXD_URL}/tmdb`
const DB_SEARCH_TEXT = 'letterboxdUser'

function convertActions(actions: any) {
	return actions.map((action: any) => {
		return new Action.Action({
			title: action.title,
			value: action.value,
			icon: new Icon({
				type: IconEnum.Iconify,
				value: action.icon
			})
		})
	})
}

function actionsContainsValue(actions: any, value: string) {
	return actions.some((action: any) => action.value === value)
}

async function getFinalURL(initialURL: string) {
    try {
        const response = await fetch(initialURL, {
            method: 'HEAD' // Use HEAD to avoid downloading the entire content
        });
        return response.url; // The final URL after redirection
    } catch (error) {
		return ''
    }
}

async function setLetterboxdUsername(username: string) {
	const existingUsername = await db.search({ searchText: DB_SEARCH_TEXT });
	if (!username) {
		if (existingUsername.length > 0) {
			await db.delete(existingUsername[0].dataId);
		}
	} else if (existingUsername.length > 0) {
		await db.update({
			dataId: existingUsername[0].dataId,
			data: JSON.stringify({ letterboxdUser: username }),
		});
	} else {
		await db.add({
			data: JSON.stringify({ letterboxdUser: username }),
			dataType: 'preference',
			searchText: DB_SEARCH_TEXT,
		});
	}
}

async function getLetterboxdUsername() {
	const existingUsername = await db.search({ searchText: DB_SEARCH_TEXT, fields: ['data', 'search_text'] });
	if (existingUsername.length > 0) {
		if (existingUsername[0].data) {
			return JSON.parse(existingUsername[0].data).letterboxdUser;
		}
	}
	return null;
}

class ExtensionTemplate extends WorkerExtension {
	highlightedItem: string = ""
	highlightedMovieId: string = ""
	currentLetterboxdUsername: string = ""
	async onFormSubmit(value: Record<string, any>): Promise<void> {
		await setLetterboxdUsername(value['clear-username'] ? '' : value.username)
		this.currentLetterboxdUsername = value.username
		toast.success(`Letterboxd username ${value['clear-username'] ? 'removed.' : "set to: " + value.username}`)
		this.load()
	}
	async load() {
		this.currentLetterboxdUsername = await getLetterboxdUsername();
		await ui.setSearchBarPlaceholder("Search for a movie...");
		await ui.render(
			new List.List({
				filter: 'none',
				items: [
				new List.Item({
					title: 'Search for a movie',
					subTitle: 'Type the a movie name in the search bar above and press enter to search.',
					icon: new Icon({
						type: IconEnum.Iconify,
						value: 'mdi:movie-search'
					}),
					value: 'search',
					defaultAction: 'Search',
					actions: new Action.ActionPanel({
						items: convertActions(specialActions)
					})
				})
			]})
		);
	}

	async onSearchTermChange(term: string): Promise<void> {
		this.searchTerm = term;
		return Promise.resolve()
	}

	async onEnterPressedOnSearchBar(): Promise<void> {
		const url = `https://tmdb-kunkun.jackyklai.workers.dev/?search=${encodeURIComponent(this.searchTerm)}`;
		const searchData = await (await fetch(url)).json();
		let actions = convertActions(generalActions)
		if (this.currentLetterboxdUsername) {
			actions = actions.concat(convertActions(friendsActions))
			actions = actions.concat(convertActions(userActions))
		}
		actions = actions.concat(convertActions(specialActions))
		ui.render(
			new List.List({
				filter: 'none',
				items: searchData.results.map((movie: any) => {
					let movieTitle: string = movie.title
					if (movie.release_date && movie.release_date.includes('-')) {
						movieTitle += ` (${movie.release_date.split('-')[0]})`
					}
					let subTitle: string = movie.overview
					if (movie.overview.length + movieTitle.length > 100) {
						subTitle = subTitle.substring(0, 100 - movieTitle.length).trim() + "..."
					}
					return new List.Item({
						title: movieTitle,
						subTitle: subTitle,
						icon: movie.poster_path ? new Icon({
							type: IconEnum.RemoteUrl,
							value: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
						}) : new Icon({
							type: IconEnum.Iconify,
							value: "mdi:movie"
						}),
						value: JSON.stringify(movie),
						defaultAction: 'Open on Letterboxd',
						actions: new Action.ActionPanel({
							items: actions
						})
					})
				})
			})
		)		
		ui.setSearchTerm('')
		return Promise.resolve()
	}

	onHighlightedListItemChanged(value: string): Promise<void> {
		this.highlightedItem = value
		this.highlightedMovieId = value == 'search' ? '' : JSON.parse(value).id
		return Promise.resolve()
	}

	async onActionSelected(value: string): Promise<void> {
		if (actionsContainsValue(generalActions, value)) {
			getFinalURL(`${LETTERBOXD_TMDB_URL}/${this.highlightedMovieId}`)
			.then((url) => {
				open.url(`${url}/${value}`)
			})
		} else if (actionsContainsValue(friendsActions, value)) {
			getFinalURL(`${LETTERBOXD_TMDB_URL}/${this.highlightedMovieId}`)
			.then((url) => {
				const base_url = url.split('/film/')[0]
				const movie_uri = url.split('/film/')[1]
				open.url(`${base_url}/${this.currentLetterboxdUsername}/friends/film/${movie_uri}/${value}`)
			})
		} else if (actionsContainsValue(userActions, value)) {
			getFinalURL(`${LETTERBOXD_TMDB_URL}/${this.highlightedMovieId}`)
			.then((url) => {
				const base_url = url.split('/film/')[0]
				const movie_uri = url.split('/film/')[1]
				open.url(`${base_url}/${this.currentLetterboxdUsername}/film/${movie_uri}/${value}`)
			})
		} else {
			if (value === 'settings') {
				let formFields: any = [
					new Form.InputField({
						key: 'username',
						label: 'Letterboxd Username',
						description: 'Providing your Letterboxd username will enable additional actions like viewing your friends\' reviews and lists.',
						optional: true,
						placeholder: await getLetterboxdUsername() ?? 'Enter your Letterboxd username'
					})
				]
				if (this.currentLetterboxdUsername) {
					formFields.push(
						new Form.BooleanField({
							key: 'clear-username',
							label: 'Clear Letterboxd Username',
							description: 'Check this box to unset the Letterboxd username',
							optional: true,
							component: 'checkbox',
							default: false
						})
					)
				}
				return ui.render(
					new Form.Form({
						key: 'settings',
						fields: formFields
					})
				)
			}
		}
	}

	onListItemSelected(value: string): Promise<void> {
		if (value !== 'search') {
			open.url(`${LETTERBOXD_TMDB_URL}/${this.highlightedMovieId}`)
		}
		return Promise.resolve()
	}
}

expose(new ExtensionTemplate())
