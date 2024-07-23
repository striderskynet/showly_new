let sunbiz_name_url = 'https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResults/EntityName/[query]/Page1?searchNameOrder=';

export async function GET({ fetch, url }) {

    let query = url.searchParams.get('q');

    let results = await fetch(sunbiz_name_url.replace('[query]', query), { method: 'GET' });
    results = await results.text();

    return new Response(results);
}