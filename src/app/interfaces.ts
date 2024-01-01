export interface Events {
    [year: number]: {
        [month: number]: {
            [day: number]: Event[];
        };
    };
}

export interface Event {
    end_time: number;
    start_time: number;
    title: string;
    color: string;
}

export interface SplitDate {
    year: number;
    month: number;
    day: number;
}