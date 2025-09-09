import { createContext, useState } from "react";
import { Box, Header, Page, Tabs } from "zmp-ui";
import { DetailPageContext, DetailPageTemplateProps } from "./context";

function DetailPageTemplate(props: DetailPageTemplateProps) {
  const [activeTab, setActiveTab] = useState<string>("0");

  return (
    <DetailPageContext.Provider value={props}>
      <Page className="bg-background" hideScrollbar>
        <Header showBackIcon title={props.title} />
        <Box className="bg-background">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="sticky top-0 z-20 bg-background"
          >
            <Tabs.Tab key="0" label="Mô tả">
              <Box className="p-4">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: props.tab1.htmlContent,
                  }}
                />
              </Box>
            </Tabs.Tab>
            <Tabs.Tab key="1" label="Đặt lịch">
              <Box className="p-4">
                {props.tab2?.bookingComponent || <div>Booking form not available</div>}
              </Box>
            </Tabs.Tab>
          </Tabs>
        </Box>
      </Page>
    </DetailPageContext.Provider>
  );
}

export default DetailPageTemplate;
