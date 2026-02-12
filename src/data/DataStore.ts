import { BaseId, TopShape } from '../state/TableDesignManager';
import { Finish } from '../types/finish';
import { TopShapeItem } from '../types/top';
import { TopFinishTextures } from '../types/topFinish';
import bases from './bases.json';
import basesFinish from './basesFinish.json';
import chairs from './chairs.json';
import finishes from './finishes.json';
import topColors from './topColors.json';
import tops from './tops.json';
import topsModel from './topsModel.json';

export class DataStore {
  getBase(id: BaseId) {
    const base = bases.bases.find((b) => b.id === id);
    if (!base) throw new Error(`Base not found: ${id}`);
    return base;
  }

  getAllBases() {
    return bases.bases;
  }

  getAllTopShapes(): TopShapeItem[] {
    return tops.tops.map((t) => ({
      id: t.id as TopShape,
      label: t.label,
      preview: t.preview,
    }));
  }

  getTopShape(shape: TopShape): TopShapeItem {
    const top = topsModel.find((t) => t.id === shape);
    if (!top) throw new Error(`Top shape not found: ${shape}`);
    return top as TopShapeItem;
  }

  // ===== Finishes =====
  getAllFinishes(): Finish[] {
    return finishes.finishes as Finish[];
  }

  getFinish(id: string) {
    const finish = finishes.finishes.find((f) => f.id === id);
    if (!finish) throw new Error(`Finish not found: ${id}`);
    return finish;
  }

  getTopFinish(id: string): TopFinishTextures | null {
    const finish = topColors.find((f) => f.id === id);
    if (!finish) return null;
    return finish as TopFinishTextures;
  }

  getBaseFinishTextures(baseId: string, colorId: string) {
    const base = basesFinish.basesFinish.find((b) => b.baseId === baseId);
    if (!base) return null;

    const color = base.colors.find((c) => c.colorId === colorId);
    if (!color) return null;

    return color.textureMaps;
  }

  // Chairs
  getAllChairs() {
    return chairs;
  }

  getChair(id: string) {
    const chair = chairs.find((c) => c.id === id);
    if (!chair) throw new Error(`Chair not found: ${id}`);
    return chair;
  }
}
