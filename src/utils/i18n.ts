import i18n from "../locales";

export function t<Str extends string>(s: Str, namespace?: GetNamespace<Str>): string {
    return i18n.t(s, namespace);
}

interface I18nOptions {
    nsSeparator?: boolean;
}

type GetNamespace<Str extends string> = AddOptions<Record<ExtractVars<Str>, string | number>, I18nOptions>;

type AddOptions<Ns, Opts> = {} extends Ns ? undefined | Opts : Ns & Opts;

type RemovePrefix<S extends string, Prefix extends string> = S extends `${Prefix}${infer S2}` ? S2 : S;

type ExtractVars<Str extends string> = Str extends `${string}{{${infer Var}}}${infer StrRest}`
    ? RemovePrefix<Var, "-"> | ExtractVars<StrRest>
    : never;

export function translationsFor<K extends string | undefined>(
    obj: Record<Extract<K, string>, string>
): Record<Extract<K, string> | "", string> {
    return { ...obj, "": "" } as Record<Extract<K, string> | "", string>;
}

/* Tests */

type IsEqual<T1, T2> = [T1] extends [T2] ? ([T2] extends [T1] ? true : false) : false;
const assertEqualTypes = <T1, T2>(_eq: IsEqual<T1, T2>): void => {};

assertEqualTypes<ExtractVars<"">, never>(true);
assertEqualTypes<ExtractVars<"name={{name}}">, "name">(true);
assertEqualTypes<ExtractVars<"name={{name}} age={{age}}">, "name" | "age">(true);

const i18nTyped = { t };

export default i18nTyped;
