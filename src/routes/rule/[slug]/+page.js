import rules from "$lib/rules"
export const load = ({ params }) => {
//console.log(rules[params.slug])
    return {
        rule: rules[params.slug].name,

        summary: rules[params.slug].summary,
        text: rules[params.slug].text,
        images: rules[params.slug].additionalContent.filter((x)=> {return x.type == 'image'})
    }
}
