/**
* Work the same in react
*/
import {
  createRef, RefObject, RenderableProps,
} from 'preact';
import { createPortal, forwardRef } from 'preact/compat';
import {
  useEffect, useLayoutEffect, useMemo, useState,
} from 'preact/hooks';
import useClickOutside from '@/hooks/useClickOutside';

import { parseClassNames } from '@/helpers/parsers';
import { getPortal } from '@/helpers/dom';

import '@/styles/popover.scss';

type TPopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

interface IPopoverProps extends RenderableProps<{}> {
  className?: string;
  noJS?: boolean;
  sticky?: boolean;
  stickTo?: RefObject<HTMLElement>
  scrollContainer?: RefObject<HTMLElement>;
  preferPlacement?: TPopoverPlacement;
  autoPosition?: boolean;
  visible?: boolean;
  header?: string;
  onClose?(): void;
}

interface IInternalPopoverProps extends RenderableProps<{}> {
  className: string;
  style: string;
  header?: string;
  onClose(): void;
}

const CSSPopover = forwardRef(({
  className, onClose, style, header, children,
}: IInternalPopoverProps, ref: RefObject<HTMLDivElement>) => {
  const contentRef = createRef<HTMLDivElement>();

  useClickOutside(contentRef, onClose);
  return <div
      ref={ref}
      className={className}
      style={style}
    >
      <div class="xowl-popover__arrow" />
      <div
        class="xowl-popover__content"
        ref={contentRef}
      >
        {
        header
          && <h4
            v-if="shouldShowHeader"
            class="xowl-popover__header"
          >
            { header }
          </h4>
        }
        <div class="xowl-popover__body">
          { children }
        </div>
      </div>
    </div>;
});

function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const html = document.documentElement;
  return rect.top >= 0
  && rect.left >= 0
  && rect.bottom <= (window.innerHeight || html.clientHeight)
  && rect.right <= (window.innerWidth || html.clientWidth);
}

interface IGetstyle {
  self: HTMLElement, stickTo: HTMLElement, priorityPlacements: TPopoverPlacement[], autoPosition: boolean, sticky: boolean,
}

function getStyle({
  self, stickTo, priorityPlacements, autoPosition, sticky,
}: IGetstyle): [string, TPopoverPlacement] {
  const {
    bottom: anchorBottom, left: anchorLeft, right: anchorRight, top: anchorTop,
  } = stickTo.getBoundingClientRect();
  let chosePlacement: TPopoverPlacement = 'bottom';
  let translateX = 0; let translateY = 0;

  const { width: selfWidth, height: selfHeight } = self.getBoundingClientRect();
  const anchorVerticalCenter = (anchorTop + anchorBottom) / 2;
  const anchorHorizontalCenter = (anchorLeft + anchorRight) / 2;
  const placementList = priorityPlacements;
  const { scrollY, scrollX } = window;
  for (let i = 0; i < placementList.length; i += 1) {
    const placement = placementList[i];
    switch (placement) {
      case 'top':
        translateX = anchorHorizontalCenter - selfWidth / 2;
        translateY = anchorTop - selfHeight;
        break;
      case 'bottom':
        translateX = anchorHorizontalCenter - selfWidth / 2;
        translateY = anchorBottom;
        break;
      case 'left':
        translateX = anchorLeft - selfWidth;
        translateY = anchorVerticalCenter - selfHeight / 2;
        break;
      case 'right':
        translateX = anchorRight;
        translateY = anchorVerticalCenter - selfHeight / 2;
        break;
      default:
        break;
    }
    translateX = Math.floor(translateX);
    translateY = Math.floor(translateY);
    let style = '';
    if (!sticky) {
      style = `
      position: absolute;
      transform: translate3d(${scrollX + translateX}px, ${scrollY + translateY}px, 0px);
      `;
    } else {
      style = `
        position: fixed;
        transform: translate3d(${translateX}px, ${translateY}px, 0px);
      `;
    }
    if (!autoPosition) {
      chosePlacement = placement;
      return [style, chosePlacement];
    }

    if (!isInViewport(self)) {
      /**
       * last el
       */
      console.log('is not in viewport');
      if (i === placementList.length - 1) {
        console.log('is last placement');
        chosePlacement = placement;
        return [style, chosePlacement];
      }
      // self.setAttribute('style', '');
    } else {
      chosePlacement = placement;
    }
  }
  return ['', chosePlacement];
}

export default function Popover({
  className = '', noJS = false, stickTo, sticky = false, preferPlacement = 'bottom', autoPosition = false, visible, header = '', onClose, children, scrollContainer,
}: IPopoverProps) {
  const selfRef = createRef<HTMLDivElement>();
  const [chosePlacement, setChosePlacement] = useState<TPopoverPlacement>('bottom');
  const [style, setStyle] = useState('');

  const priorityPlacements = useMemo(() => {
    if (!autoPosition) return [preferPlacement];
    const defaultOrder: TPopoverPlacement[] = ['top', 'bottom', 'left', 'right'];
    return defaultOrder.sort((p1) => {
      if (p1 === preferPlacement) return -1;
      return 0;
    });
  }, [autoPosition, preferPlacement]);

  useEffect(() => {
    console.log('scroll-container-change');
  }, [scrollContainer]);

  useLayoutEffect(() => {
    if (noJS) return;
    if (!visible) return;
    // let shouldSetup = true;
    function setup() {
      // window.requestAnimationFrame(setup)
      // if (!shouldSetup) return
      if (!selfRef.current) return;
      if (!stickTo?.current) return;
      const [s, placement] = getStyle({
        self: selfRef.current, autoPosition, priorityPlacements, stickTo: stickTo.current, sticky,
      });
      setStyle(s);
      setChosePlacement(placement);
    }

    setup();

    const sC = scrollContainer?.current;
    if (sC) {
      sC.addEventListener('scroll', setup);
    }

    window.addEventListener('resize', setup);
    window.addEventListener('scroll', setup);

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener('resize', setup);
      if (sC) {
        sC.removeEventListener('scroll', setup);
      }
      window.removeEventListener('scroll', setup);
    };
  }, [noJS, stickTo, autoPosition, scrollContainer, sticky, priorityPlacements, selfRef, visible]);

  function hide() {
    if (!visible) return;
    onClose?.();
  }

  useClickOutside(selfRef, hide);

  if (!visible) return null;

  const cl = parseClassNames([{ 'xowl-popover--visible': !!visible, 'xowl-popover--nojs': noJS }, `xowl-popover--${chosePlacement || preferPlacement}`, className, 'xowl-popover']);

  const popover = <CSSPopover ref={selfRef} className={cl} onClose={hide} style={style} header={header}> { children } </CSSPopover>;

  if (noJS) return popover;
  return <> { createPortal(popover, getPortal()!) } </>;
}

/**
 * Style here
 */

