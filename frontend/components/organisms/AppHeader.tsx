"use client";

import { NavTabButton } from "@/components/molecules/NavTabButton";
import { bp } from "@/lib/breakpoints";
import NextImage from "next/image";
import styled from "styled-components";

const TABS = ["채팅", "교범 검색", "출처 문서"] as const;

const Shell = styled.header`
  background: linear-gradient(to right, #020617, #172554, #0f172a);
  color: #fff;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
`;

const Inner = styled.div`
  display: flex;
  min-height: 4rem;
  width: 100%;
  min-width: 0;
  flex-direction: column;

  @media (min-width: ${bp.lg}) {
    height: 5rem;
    min-height: 0;
    flex-direction: row;
    align-items: stretch;
  }
`;

const Brand = styled.button`
  display: flex;
  min-width: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
  align-items: center;
  gap: 0.25rem;
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
  padding: 0.75rem 1rem;

  @media (min-width: ${bp.sm}) {
    gap: 0.375rem;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }

  @media (min-width: ${bp.lg}) {
    height: 100%;
    min-width: min(100%, 16rem);
    max-width: 20rem;
    border-bottom: none;
    border-right: 1px solid rgb(255 255 255 / 0.1);
    padding-top: 0;
    padding-bottom: 0;
  }

  @media (min-width: ${bp.xl}) {
    min-width: 18rem;
  }


  &:hover {
    text-decoration: none;
  }

  &:focus-visible {
    outline: 2px solid #bfdbfe;
    outline-offset: -4px;
  }
`;


const BrandHint = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const LogoBox = styled.div`
  position: relative;
  display: flex;
  height: 2.5rem;
  width: 4.25rem;
  flex-shrink: 0;
  align-items: center;

  @media (min-width: ${bp.sm}) {
    height: 3rem;
    width: 5rem;
  }
`;

const LogoImage = styled(NextImage)`
  height: 100%;
  width: 100%;
  max-height: 2.5rem;
  object-fit: contain;
  object-position: left;

  @media (min-width: ${bp.sm}) {
    max-height: 3rem;
  }
`;

const TitleBlock = styled.div`
  min-width: 0;
`;

const Title = styled.h1`
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.025em;

  @media (min-width: ${bp.sm}) {
    font-size: 1.25rem;
  }

  @media (min-width: ${bp.lg}) {
    font-size: 1.5rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  min-height: 3rem;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 0.25rem;
  overflow-x: auto;
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
  padding: 0.5rem;

  @media (min-width: ${bp.sm}) {
    gap: 0.5rem;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  @media (min-width: ${bp.lg}) {
    min-height: 0;
    justify-content: center;
    gap: 1rem;
    overflow: visible;
    border-bottom: none;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  @media (min-width: ${bp.xl}) {
    gap: 2rem;
  }
`;

const Actions = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.5rem 1rem;

  @media (min-width: ${bp.sm}) {
    gap: 0.75rem;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }

  @media (min-width: ${bp.lg}) {
    min-width: 12rem;
    max-width: 28rem;
    border-left: 1px solid rgb(255 255 255 / 0.1);
    padding-top: 0;
    padding-bottom: 0;
  }

  @media (min-width: ${bp.xl}) {
    min-width: 16rem;
  }
`;

type AppHeaderProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function AppHeader({ activeTab, onTabChange }: AppHeaderProps) {
  return (
    <Shell>
      <Inner>
        <Brand type="button" onClick={() => onTabChange("채팅")} aria-label="채팅 화면으로 이동">
          <LogoBox>
            <LogoImage
              src="/header-emblem.png"
              alt="닻·별·날개 엠블럼"
              width={220}
              height={176}
              priority
            />
          </LogoBox>
          <TitleBlock>
            <Title>DOCTOR</Title>
          </TitleBlock>
          <BrandHint>채팅으로 이동</BrandHint>
        </Brand>

        <Nav aria-label="주 메뉴">
          {TABS.map((tab) => (
            <NavTabButton key={tab} label={tab} active={activeTab === tab} onClick={() => onTabChange(tab)} />
          ))}
        </Nav>

        <Actions aria-hidden="true" />
      </Inner>
    </Shell>
  );
}
