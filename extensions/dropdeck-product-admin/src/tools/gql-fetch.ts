type QueryBody = {
	query: string,
	variables: {
		[key: string]: string | number | boolean
	},
}

export const gqlFetch = (queryBody: QueryBody, callback: (data: any) => void) => {
	return fetch("shopify:admin/api/graphql.json", {
			method: "POST",
			body: JSON.stringify(queryBody),
	})
	.then(res => res.json())
	.then(data => callback(data))
	.catch(err => {
		console.error(err);
	});
};