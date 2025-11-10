const firstTimeCaller = {
  id : '31AHEQAAQBAJ',
  title : 'First-Time Caller',
  author : 'B.K. Borison',
  pages : 449,
  publishedDate : '2025-02-11',
  description : 'INSTANT NEW YORK TIMES BESTSELLER A hopeless romantic meets a jaded radio host in this cozy, Sleepless in Seattle–inspired love story from beloved author B.K. Borison. Aiden Valentine has a secret: he’s fallen out of love with love. And as the host of Baltimore’s romance hotline, that’s a bit of a problem. But when a young girl calls in to the station asking for dating advice for her mom, the interview goes viral, thrusting Aiden and Heartstrings into the limelight. Lucie Stone thought she was doing just fine. She has a good job; an incredible family; and a smart, slightly devious kid. But when all of Baltimore is suddenly scrutinizing her love life—or lack thereof—she begins to question if she’s as happy as she believed. Maybe a little more romance wouldn’t be such a bad thing. Everyone wants Lucie to find her happy ending…even the handsome, temperamental man calling the shots. But when sparks start to fly behind the scenes, Lucie must make the final decision between the radio-sponsored happily ever after or the man in the headphones next to her.',
  imageurl : 'https://covers.openlibrary.org/b/id/14840886-M.jpg'
}

// export interface Book {
//   id: string;
//   title: string;
//   author: string;
//   pages: number;
//   publishedDate: string;
//   description: string;
//   imageurl: string;
// }

interface Genres {
  genre : Genre;
}

interface Genre {
  genre : string;
}

export interface BookBasic {
  title : string;
}

export interface BookOpen extends BookBasic{
  imageId? : number | null;
  author : string;
  publishYear : number | null;
}

export interface BookWithData extends BookOpen {
  imageUrl : string;
}