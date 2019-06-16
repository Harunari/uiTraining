window.onload = () => { };

function makeDraggable(evt: Event) {
  new DraggableObject(<SVGSVGElement>evt.target);
}

interface ICoordinate {
  x: number;
  y: number;
}

class DraggableObject {
  private rootSvgElement: SVGSVGElement;
  private selectedElement: SVGSVGElement | null = null;
  private offset: ICoordinate = { x: 0, y: 0 };
  private transform: SVGTransform | null = null;


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
  }
  private drag(event: Event): void {
    if (!this.rootSvgElement) { return; }
    if (!this.selectedElement) { return; }
    if (!this.transform) { return; }

    event.preventDefault();
    const coordinate = this.getMousePostion(<MouseEvent>event);
    this.transform.setTranslate(coordinate.x - this.offset.x, coordinate.y - this.offset.y);
  }
  private endDrag(): void {
    this.selectedElement = null;
  }
  private initializeDragging(event: Event): ICoordinate {
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
  private getMousePostion(event: MouseEvent): ICoordinate {
    const svgElement = <SVGGraphicsElement>this.rootSvgElement;
    const ctm = <DOMMatrix>svgElement.getScreenCTM();
    return {
      x: (event.clientX - ctm.e) / ctm.a,
      y: (event.clientY - ctm.f) / ctm.d
    }
  }
}