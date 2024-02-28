import { Injectable } from '@nestjs/common';
import { Result } from 'apps/statistics-baloto/common/interface/result.interface';

@Injectable()
export class DataManagerService {
  private data = {
    count: {
      trad: {},
      tradBalo: {},
      rev: {},
      revBalo: {},
    },
    lastest: {
      trad: {},
      tradBalo: {},
      rev: {},
      revBalo: {},
    },
    ave: {
      trad: {},
      tradBalo: {},
      rev: {},
      revBalo: {},
    },
  };

  async handleData(traditional: Result[], revancha: Result[]) {
    this.countNumber(traditional);
    this.countNumber(revancha, true);
    this.lastestPlays(traditional);
    this.lastestPlays(revancha, true);
    this.averageOfNotShowingUp(traditional);
    this.averageOfNotShowingUp(revancha, true);
  }

  // cantidad de los numeros que salieron [cantidad, key]
  private async countNumber(array: Result[], isRevancha = false) {
    let yellowMap = new Map();
    let redMap = new Map();
    const arrYellow = [];
    const arrRed = [];

    // This cicle counts the number of the array and add them to the maps
    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < 5; j++) {
        yellowMap.set(
          array[i].results[j],
          yellowMap.has(array[i].results[j])
            ? Number(yellowMap.get(array[i].results[j])) + 1
            : 1,
        );
      }

      redMap.set(
        array[i].balota[0],
        redMap.has(array[i].balota[0])
          ? Number(redMap.get(array[i].balota[0])) + 1
          : 1,
      );
    }

    // sort the maps
    yellowMap = new Map(
      [...yellowMap.entries()].sort((a, b) => Number(a[1]) - Number(b[1])),
    );
    redMap = new Map(
      [...redMap.entries()].sort((a, b) => Number(a[1]) - Number(b[1])),
    );

    // adds them to the arrays
    yellowMap.forEach((value, key) =>
      arrYellow.push({ quantity: value, _id: Number(key) }),
    );
    redMap.forEach((value, key) =>
      arrRed.push({ quantity: value, _id: Number(key) }),
    );

    if (!isRevancha) {
      this.data.count.trad = arrYellow;
      this.data.count.tradBalo = arrRed;
    } else {
      this.data.count.rev = arrYellow;
      this.data.count.revBalo = arrRed;
    }

    try {
      console.log(JSON.stringify(arrYellow));
      console.log(JSON.stringify(arrRed));
    } catch (error) {
      console.error(`ERROR on CountNumber ${error}`);
    }
  }

  // gets the latest
  private async lastestPlays(array: Result[], isRevancha = false) {
    let map = new Map();
    let mapBalota = new Map();
    const arrBalota = [];
    const arr = [];
    const arr2 = [];

    // This cicle assing every result in the array to arrBalota
    for (let i = 0; i < array.length; i++) {
      arrBalota.push(array[i].balota[0]);
    }

    //
    for (let i = 1; i <= 43; i++) {
      let acum = 0;
      for (let j = array.length - 1; j >= 0; j--) {
        if (!array[j].results.find((e) => Number(e) === i)) acum++;
        else break;
      }
      map.set(i, acum);
    }

    for (let i = 1; i <= 16; i++) {
      let acum = 0;
      for (let j = arrBalota.length - 1; j >= 0; j--) {
        if (Number(arrBalota[j]) !== i) acum++;
        else break;
      }
      mapBalota.set(i, acum);
    }

    map = new Map(
      [...map.entries()].sort((a, b) => Number(a[1]) - Number(b[1])),
    );
    map.forEach((value, key) =>
      arr.push({ quantity: value, _id: Number(key) }),
    );
    mapBalota = new Map(
      [...mapBalota.entries()].sort((a, b) => Number(a[1]) - Number(b[1])),
    );
    mapBalota.forEach((value, key) =>
      arr2.push({ quantity: value, _id: Number(key) }),
    );

    if (!isRevancha) {
      this.data.lastest.trad = arr;
      this.data.lastest.tradBalo = arr2;
    } else {
      this.data.lastest.rev = arr;
      this.data.lastest.revBalo = arr2;
    }

    try {
      console.log(JSON.stringify(arr));
      console.log(JSON.stringify(arr2));
    } catch (error) {
      console.error(error);
    }
  }

  // gets the latest
  private async averageOfNotShowingUp(array = [], isRevancha = false) {
    let map = new Map();
    let mapBalota = new Map();
    const arrBalota = [];
    const arr = [];
    const arr2 = [];

    const arraytempo = array.slice(array.length - 50, array.length);

    // This cicle assing every result in the array to arrBalota
    for (let i = 0; i < arraytempo.length; i++) {
      arrBalota.push(arraytempo[i].balota[0]);
    }

    let differenceBetween = [];
    for (let i = 1; i <= 43; i++) {
      let acum = 0;
      differenceBetween = [];
      for (let j = arraytempo.length - 1; j >= 0; j--) {
        if (!arraytempo[j].results.find((e) => Number(e) === i)) {
          acum++;
        } else {
          differenceBetween.push(acum);
          acum = 0;
        }
      }
      map.set(
        i,
        differenceBetween.reduce((a, b) => a + b, 0) / differenceBetween.length,
      );
    }

    for (let i = 1; i <= 16; i++) {
      let acum = 0;
      differenceBetween = [];
      for (let j = arraytempo.length - 1; j >= 0; j--) {
        if (Number(arrBalota[j]) !== i) {
          acum++;
        } else {
          differenceBetween.push(acum);
          acum = 0;
        }
      }
      mapBalota.set(
        i,
        differenceBetween.reduce((a, b) => a + b, 0) / differenceBetween.length,
      );
    }

    map = new Map(
      [...map.entries()].sort((a, b) => Number(a[1]) - Number(b[1])),
    );
    map.forEach((value, key) =>
      arr.push({ quantity: value, _id: Number(key) }),
    );
    mapBalota = new Map(
      [...mapBalota.entries()].sort((a, b) => Number(a[1]) - Number(b[1])),
    );
    mapBalota.forEach((value, key) =>
      arr2.push({ quantity: value, _id: Number(key) }),
    );

    if (!isRevancha) {
      this.data.ave.trad = arr;
      this.data.ave.tradBalo = arr2;
    } else {
      this.data.ave.rev = arr;
      this.data.ave.revBalo = arr2;
    }

    try {
      console.log(JSON.stringify(arr));
      console.log(JSON.stringify(arr2));
    } catch (error) {
      console.error(error);
    }
  }
}
