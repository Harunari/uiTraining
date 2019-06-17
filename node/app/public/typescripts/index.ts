window.onload = () => { };

function makeDraggable(evt: Event) {
  new DraggableObject(<SVGSVGElement>evt.target);
}

interface Coordinate {
  x: number;
  y: number;
}

class ConfinedOption {
  public isConfined: boolean = false;
  public minX: number = 0;
  public maxX: number = 0;
  public minY: number = 0;
  public maxY: number = 0;

  public readonly boundaryX1: number = 10.5;
  public readonly boundaryX2: number = 30;
  public readonly boundaryY1: number = 2.2;
  public readonly boundaryY2: number = 19.2;

  public calcRealm(svgGraphicElement: SVGGraphicsElement): void {
    if (!this.isConfined) { return; }

    let bbox = svgGraphicElement.getBBox();
    this.minX = this.boundaryX1 - bbox.x;
    this.maxX = this.boundaryX2 - bbox.x - bbox.width;
    this.minY = this.boundaryY1 - bbox.y;
    this.maxY = this.boundaryY2 - bbox.y - bbox.height;
  }

  public getConstratedCoordinate(dx: number, dy: number): Coordinate {
    if (!this.isConfined) { return { x: dx, y: dy }; }

    if (dx < this.minX) {
      dx = this.minX;
    } else if (dx > this.maxX) {
      dx = this.maxX;
    }

    if (dy < this.minY) {
      dy = this.minY
    } else if (dy > this.maxY) {
      dy = this.maxY;
    }
    return { x: dx, y: dy };
  }
}

class DraggableObject {
  private rootSvgElement: SVGSVGElement;
  private selectedElement: SVGSVGElement | null = null;
  private offset: Coordinate = { x: 0, y: 0 };
  private transform: SVGTransform | null = null;
  private confinedOption = new ConfinedOption();

  constructor(svgTarget: SVGSVGElement) {
    this.rootSvgElement = svgTarget;
    svgTarget.addEventListener('mousedown', e => this.startDrag(e));
    svgTarget.addEventListener('mousemove', e => this.drag(e));
    svgTarget.addEventListener('mouseup', () => this.endDrag());
    svgTarget.addEventListener('mouseleave', () => this.endDrag());
  }

  private startDrag(event: Event): void {
    let eTarget = <Element>event.target;
    if (eTarget.classList.contains('draggable')) {
      this.selectedElement = <SVGSVGElement>eTarget;
      this.offset = this.initializeDragging(event);
    } else if ((eTarget.parentNode as Element).classList.contains('draggable-group')) {
      this.selectedElement = <SVGSVGElement>eTarget.parentNode;
      this.offset = this.initializeDragging(event);
    }

    this.confinedOption.isConfined = eTarget.classList.contains('confine');
    this.confinedOption.calcRealm(eTarget as SVGGraphicsElement);
  }
  private drag(event: Event): void {
    if (!this.rootSvgElement) { return; }
    if (!this.selectedElement) { return; }
    if (!this.transform) { return; }

    event.preventDefault();
    const coordinate = this.getMousePostion(<MouseEvent>event);
    const dx = coordinate.x - this.offset.x;
    const dy = coordinate.y - this.offset.y;
    const fixedCoordinate = this.confinedOption.getConstratedCoordinate(dx, dy);
    this.transform.setTranslate(fixedCoordinate.x, fixedCoordinate.y);
    console.log(fixedCoordinate.y);
  }
  private endDrag(): void {
    this.selectedElement = null;
  }
  private initializeDragging(event: Event): Coordinate {
    if (!this.selectedElement) { return { x: 0, y: 0 }; }
    if (!this.rootSvgElement) { return { x: 0, y: 0 }; }

    const offset = this.getMousePostion(<MouseEvent>event);
    const transforms = this.selectedElement.transform.baseVal;
    if (transforms.numberOfItems === 0 ||
      transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
      const translate = this.rootSvgElement.createSVGTransform();
      translate.setTranslate(0, 0);
      this.selectedElement.transform.baseVal.insertItemBefore(translate, 0);
    }

    this.transform = transforms.getItem(0) as SVGTransform;
    offset.x -= this.transform.matrix.e;
    offset.y -= this.transform.matrix.f;
    return offset;
  }
  private getMousePostion(event: MouseEvent): Coordinate {
    const svgElement = <SVGGraphicsElement>this.rootSvgElement;
    const ctm = <DOMMatrix>svgElement.getScreenCTM();
    return {
      x: (event.clientX - ctm.e) / ctm.a,
      y: (event.clientY - ctm.f) / ctm.d
    }
  }
}