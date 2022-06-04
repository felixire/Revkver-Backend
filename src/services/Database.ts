import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig'
import { AddSubredditRequest } from '../model/AddSubredditRequest';

const db = new JsonDB(new Config("./database/database", true, true, '/'));

abstract class Subreddit {
    "name": string;
    "url": string;
    "fetchOlderPosts": boolean;
    "lastUpdate": number;
    "lastID": string;
}

export const addSubreddits = (request: AddSubredditRequest): void => {
    const subreddits = getSubreddits();

    const newSubreddits: Array<Subreddit> = request.subreddits.filter(sub => subreddits.find(s => s.name === sub.name) == undefined).map(sub => {
        return {
            "name": sub.name,
            "url": `r/${sub.name}`,
            "fetchOlderPosts": sub.fetchOlderPosts,
            "lastUpdate": -1,
            "lastID": ''
        }
    });

    const newUsers: Array<Subreddit> = request.users.filter(sub => subreddits.find(s => s.name === sub.name) == undefined).map(sub => {
        return {
            "name": sub.name,
            "url": `u/${sub.name}`,
            "fetchOlderPosts": sub.fetchOlderPosts,
            "lastUpdate": -1,
            "lastID": ''
        }
    });

    db.push('/subreddits', [...newSubreddits, ...newUsers], false);
}

export const getSubreddits = (): Subreddit[] => {
    try {
        return db.getData('/subreddits');
    } catch (error) {
        return [];
    }
}

export const getSubreddit = (subreddit: string): Subreddit | undefined => {
    try {
        return db.getData("/subreddits[" + db.getIndex("/subreddits", subreddit, 'name') + "]");
    } catch (error) {
        return undefined;
    }
}

export const removeSubreddit = (subreddit: string): void => {
    db.delete("/subreddits[" + db.getIndex("/subreddits", subreddit, 'name') + "]");
}

export const updateAllSubreddits = (): void => {
    const subreddits = getSubreddits();
    const time = +new Date();

    subreddits.forEach(sub => {
        sub.lastUpdate = time
    });

    db.push('/subreddits', subreddits, true);
}

export const updateSingleSubreddit = (subreddit: string, newData: Subreddit): void => {
    const subreddits = getSubreddits();

    const index = db.getIndex("/subreddits", subreddit, 'name');
    subreddits[index] = newData;


    db.push('/subreddits', subreddits, true);
}