import { json, redirect } from '@remix-run/node';

import {
    Form,
    Links,
    Link,
    NavLink,
    Outlet,
    LiveReload,
    Meta,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useNavigation,
} from '@remix-run/react';

import { useEffect, useState } from 'react';

import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import { createEmptyContact, getContacts } from './data';
import appStylesHref from './app.css';

export const action = async () => {
    const contact = await createEmptyContact();
    return redirect(`/contacts/${contact.id}/edit`);
};

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: appStylesHref }];
export const loader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const contacts = await getContacts(q);
    return json({ contacts, q });
};

export default function App() {
    const { contacts, q } = useLoaderData<typeof loader>();
    const navigation = useNavigation();

    // the query now needs to be kept in state
    const [query, setQuery] = useState(q || '');

    // we still have a `useEffect` to synchronize the query
    // to the component state on back/forward button clicks
    useEffect(() => {
        setQuery(q || '');
    }, [q]);

    return (
        <html lang='en'>
            <head>
                <meta charSet='utf-8' />
                <meta name='viewport' content='width=device-width, initial-scale=1' />
                <Meta />
                <Links />
            </head>
            <body>
                <div id='sidebar'>
                    <h1>Remix Contacts</h1>
                    <div>
                        <Form id='search-form' role='search'>
                            <input
                                id='q'
                                aria-label='Search contacts'
                                // switched to `value` from `defaultValue`
                                value={query}
                                // synchronize user's input to component state
                                onChange={(event) => setQuery(event.currentTarget.value)}
                                placeholder='Search'
                                type='search'
                                name='q'
                            />
                            <div id='search-spinner' aria-hidden hidden={true} />
                        </Form>
                        <Form method='post'>
                            <button type='submit'>New</button>
                        </Form>
                    </div>
                    <nav>
                        {contacts.length ? (
                            <ul>
                                {contacts.map((contact) => (
                                    <li key={contact.id}>
                                        <NavLink
                                            className={({ isActive, isPending }) =>
                                                isActive
                                                    ? 'active'
                                                    : isPending
                                                    ? 'pending'
                                                    : ''
                                            }
                                            to={`contacts/${contact.id}`}>
                                            {contact.first || contact.last ? (
                                                <>
                                                    {contact.first} {contact.last}
                                                </>
                                            ) : (
                                                <i>No Name</i>
                                            )}{' '}
                                            {contact.favorite ? <span>★</span> : null}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>
                                <i>No contacts</i>
                            </p>
                        )}
                    </nav>
                </div>
                <div
                    className={navigation.state === 'loading' ? 'loading' : ''}
                    id='detail'>
                    <Outlet />
                </div>

                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}
