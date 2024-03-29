"use client";
import HeaderBackLink from "@app/components/header/HeaderBackLink";
import { MenuIcon } from "@app/components/icon/MenuIcon";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import GroupBattingRankingTable from "@app/components/table/GroupBattingRankingTable";
import GroupPitchingRankingTable from "@app/components/table/GroupPitchingRankingTable";
import { useAuthContext } from "@app/contexts/useAuthContext";
import { getGroupDetail } from "@app/services/groupService";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import AnchorLink from "react-anchor-link-smooth-scroll";

type GroupDetailProps = {
  params: {
    slug: number;
  };
};

type GroupsDetailData = {
  accepted_users: [
    {
      id: number;
      image: {
        url: string;
      };
      name: string;
      user_id: string;
    }
  ];
  batting_averages: [
    {
      hit: number | null;
      home_run: number | null;
      id: number | null;
      runs_batted_in: number | null;
      stealing_base: number | null;
      name: string;
      user_id: string;
      image: {
        url: string;
      };
    }
  ];
  batting_stats: [
    {
      batting_average: number;
      on_base_percentage: number;
      user_id: string;
    }
  ];
  pitching_aggregate: [
    {
      win: number;
      hold: number;
      saves: number;
      strikeouts: number;
    }
  ];
  pitching_stats: [
    {
      era: number;
      win_percentage: number;
      user_id: string;
    }
  ];
  group: {
    icon: {
      url: string;
    };
    name: string;
  };
  id: number;
};

type AcceptedUsers = {
  id: number;
  image: {
    url: string;
  };
  name: string;
  user_id: string;
};

type BattingAverage = {
  hit: number | null;
  home_run: number | null;
  id: number | null;
  runs_batted_in: number | null;
  stealing_base: number | null;
  name: string;
  user_id: string;
  image_url: string;
};

type BattingStats = {
  batting_average: number;
  on_base_percentage: number;
  name: string;
  user_id: string;
  image_url: string;
};

type PitchingAggregate = {
  win: number;
  hold: number;
  saves: number;
  strikeouts: number;
  name: string;
  user_id: string;
  image_url: string;
};

type PitchingStats = {
  era: number;
  win_percentage: number;
  name: string;
  user_id: string;
  image_url: string;
};

const BattingAverageTitle = [
  { id: 0, title: "打率", Link: "#battingAverage" },
  { id: 1, title: "本塁打", Link: "#homeRun" },
  { id: 2, title: "打点", Link: "#run" },
  { id: 3, title: "安打", Link: "#hit" },
  { id: 4, title: "盗塁", Link: "#stealingBase" },
  { id: 5, title: "出塁率", Link: "#onBasePercentage" },
];

const PitchingResultTitle = [
  { id: 0, title: "防御率", Link: "#era" },
  { id: 1, title: "勝利", Link: "#win" },
  { id: 2, title: "セーブ", Link: "#saves" },
  { id: 3, title: "HP", Link: "#hp" },
  { id: 4, title: "奪三振", Link: "#strikeouts" },
  { id: 5, title: "勝率", Link: "#winPercentage" },
];

export default function GroupDetail({ params }: GroupDetailProps) {
  const [groupData, setGroupData] = useState<GroupsDetailData | undefined>(
    undefined
  );
  const [acceptedUsers, setAcceptedUsers] = useState<AcceptedUsers[]>();
  const [battingAverage, setBattingAverages] = useState<BattingAverage[]>();
  const [battingStats, setBattingStats] = useState<BattingStats[]>();
  const [pitchingAggregate, setPitchingAggregate] =
    useState<PitchingAggregate[]>();
  const [pitchingStats, setPitchingStats] = useState<PitchingStats[]>();
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();

  useEffect(() => {
    if (isLoggedIn === false) {
      return router.push("/signin");
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const responseGroupDetail = await getGroupDetail(params.slug);
      setGroupData(responseGroupDetail);
      setAcceptedUsers(responseGroupDetail.accepted_users);

      if (responseGroupDetail) {
        const battingStatsWithUsersData = responseGroupDetail.batting_stats.map(
          (stats: any) => {
            const userInfo = responseGroupDetail.accepted_users.find(
              (user: any) => user.id === stats.user_id
            );
            if (userInfo) {
              return {
                ...stats,
                name: userInfo.name,
                user_id: userInfo.user_id,
                image_url: userInfo.image.url,
              };
            }
            return stats;
          }
        );
        setBattingStats(battingStatsWithUsersData);

        const battingAverageWithUsersData = responseGroupDetail.batting_averages
          .flat()
          .map((stats: any) => {
            const userInfo = responseGroupDetail.accepted_users.find(
              (user: any) => user.id === stats.user_id
            );
            if (userInfo) {
              return {
                ...stats,
                name: userInfo.name,
                user_id: userInfo.user_id,
                image_url: userInfo.image.url,
              };
            }
            return stats;
          });
        setBattingAverages(battingAverageWithUsersData);

        const pitchingAggregateWithUsersData =
          responseGroupDetail.pitching_aggregate.flat().map((stats: any) => {
            const userInfo = responseGroupDetail.accepted_users.find(
              (user: any) => user.id === stats.user_id
            );
            if (userInfo) {
              return {
                ...stats,
                name: userInfo.name,
                user_id: userInfo.user_id,
                image_url: userInfo.image.url,
              };
            }
            return stats;
          });
        setPitchingAggregate(pitchingAggregateWithUsersData);

        const pitchingStatsWithUsersData = responseGroupDetail.pitching_stats
          .filter((stats: any) => stats != null)
          .map((stats: any) => {
            const userInfo = responseGroupDetail.accepted_users.find(
              (user: any) => user.id === stats.user_id
            );
            if (userInfo) {
              return {
                ...stats,
                name: userInfo.name,
                user_id: userInfo.user_id,
                image_url: userInfo.image.url,
              };
            }
            return stats;
          });
        setPitchingStats(pitchingStatsWithUsersData);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        router.push("/404");
      } else {
        console.error(error);
      }
    }
  };

  if (!groupData) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="buzz-dark flex flex-col w-full min-h-screen">
        <HeaderBackLink
          backLink={"/groups"}
          groupName={groupData?.group.name}
          groupIconLink={`${groupData?.group.icon.url}`}
        />
        <div className="h-full bg-main">
          <main className="h-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
            <div className="pt-16 pb-36 px-4 bg-main lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:px-6 lg:pb-6 lg:mb-10">
              <div className="w-fit ml-auto mr-0">
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly variant="faded">
                      <MenuIcon width="24" height="24" fill="#fff" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Static Actions">
                    <DropdownItem
                      key="memberIndex"
                      href={`/groups/${params.slug}/member/edit`}
                    >
                      メンバー一覧
                    </DropdownItem>
                    <DropdownItem
                      key="memberAdd"
                      href={`/groups/${params.slug}/new-member/edit`}
                    >
                      メンバー招待
                    </DropdownItem>
                    <DropdownItem
                      key="edit"
                      href={`/groups/${params.slug}/info/edit`}
                    >
                      グループ編集
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <h2 className="text-xl font-bold mt-2 lg:text-2xl">
                個人成績ランキング
              </h2>
              <div>
                <Tabs
                  color="primary"
                  size="md"
                  aria-label="成績種類"
                  radius="md"
                  variant="solid"
                  className="w-full grid mt-5"
                >
                  <Tab
                    key="batting"
                    title="打撃成績"
                    className="font-bold tracking-wide"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {BattingAverageTitle.map((title) => (
                        <Button
                          key={title.id}
                          color="primary"
                          variant="ghost"
                          size="sm"
                          radius="sm"
                        >
                          <AnchorLink offset="100" href={title.Link}>
                            {title.title}
                          </AnchorLink>
                        </Button>
                      ))}
                    </div>
                    <div className="mt-6">
                      <GroupBattingRankingTable
                        battingAverage={battingAverage}
                        battingStats={battingStats}
                      />
                    </div>
                  </Tab>
                  <Tab
                    key="pitching"
                    title="投手成績"
                    className="font-bold tracking-wide"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {PitchingResultTitle.map((title) => (
                        <Button
                          key={title.id}
                          color="primary"
                          variant="ghost"
                          size="sm"
                          radius="sm"
                        >
                          <AnchorLink offset="100" href={title.Link}>
                            {title.title}
                          </AnchorLink>
                        </Button>
                      ))}
                    </div>{" "}
                    <div className="mt-6">
                      <GroupPitchingRankingTable
                        pitchingAggregate={pitchingAggregate}
                        pitchingStats={pitchingStats}
                      />
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
