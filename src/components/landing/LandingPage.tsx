"use client";
import React, { useState } from 'react';
import { Layout, Button, Row, Col, Typography, Space, Flex, Card, Badge, Drawer, Collapse, Divider } from 'antd';
import { MenuOutlined, ThunderboltOutlined, BarChartOutlined, NodeIndexOutlined, SmileOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Segmented, Statistic, ConfigProvider } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import styles from './LandingPage.module.css';
import Link from 'next/link';

import { Tag, Avatar } from 'antd';
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  GlobalOutlined,
  TeamOutlined,
  ThunderboltFilled,
  PieChartFilled,
  AppstoreFilled
} from '@ant-design/icons';
import {
  FacebookFilled,
  InstagramFilled,
  XOutlined,
  LinkedinFilled,
  YoutubeFilled
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// Static content and presentational helpers live at module scope. Rebuilt inside
// the render they became new array/component identities on every state change
// (drawer, workflow tab, billing toggle), which remounted the nav and re-rendered
// the whole FAQ Collapse for no reason.
const faqData = [
  { key: '1', label: 'What kind of analytics does ShopWave provide?', children: 'ShopWave integrates seamlessly with leading tools like Slack for team communication, Shopify for online stores, and Google Analytics for performance tracking. These integrations make it easy to connect all the tools you rely on.' },
  { key: '2', label: 'Is there a limit to the number of users?', children: 'Our Enterprise plan offers unlimited users, while Free and Pro plans have specific seat limits tailored for smaller teams.' },
  { key: '3', label: 'How does ShopWave help with team management?', children: 'Assign roles, track individual performance metrics, and collaborate on shared dashboards in real-time.' },
  { key: '4', label: 'Can I customize my dashboard?', children: 'Yes, our drag-and-drop interface allows you to pin the most important KPIs and hide what you don\'t need.' }
];

const footerLinks = [
  {
    title: 'Product',
    links: ['Dashboard', 'Features', 'Pricing', 'Support'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'FAQs', 'Tutorial', 'Case Studies'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Blog', 'Contact Us'],
  },
  {
    title: 'Community',
    links: ['Forum', 'Events', 'Ambassador Program', 'Partner Network'],
  },
];

/**
 * Shared by the three stats in the final CTA card, which sits on a dark
 * background and so needs both slots forced to white.
 *
 * AntD 6 replaced `valueStyle` with the `styles` semantic-slot API, where the
 * value lives in the `content` slot. `styles.title` covers the other half:
 * each title used to be wrapped in `<span style={{ color: '#fff' }}>` purely to
 * recolour it, which the slot now does without the extra element.
 */
const CTA_STAT_STYLES = {
  title: { color: '#fff' },
  content: { color: '#fff', fontSize: '14px' },
};

const NavLinks = () => (
  <>
    <Text strong className={styles.navLink}>Home</Text>
    <Text type="secondary" className={styles.navLink}>Features</Text>
    <Text type="secondary" className={styles.navLink}>Pricing</Text>
    <Text type="secondary" className={styles.navLink}>Blog</Text>
    <Text type="secondary" className={styles.navLink}>Contact</Text>
  </>
);

const LandingPage = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState('track');

  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly');

  const currentYear = new Date().getFullYear();

  return (
    <Layout className={styles.layout}>
      {/* HEADER WITH MOBILE DRAWER */}
      <Header className={styles.header}>
        <div className={styles.logo}>
          <ThunderboltOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
          <span style={{ fontWeight: 800, fontSize: '20px', marginLeft: '8px' }}>ShopWave</span>
        </div>

        {/*
          Responsive nav is CSS-driven, not JS-driven. useBreakpoint() reports no
          breakpoints until it subscribes after mount, so a ternary on screens.md
          baked the *mobile* hamburger into the static HTML and desktop visitors
          saw it flip to the full nav on hydration.

          `md:contents` keeps both <Space> elements as direct children of the
          flex header (display:contents), so the space-between layout is
          byte-for-byte what the ternary produced at >=768px — the same
          breakpoint antd's `md` uses.
        */}
        <div className="hidden md:contents">
          <Space size="large"><NavLinks /></Space>
          <Space>
            <Button type="text">Contact Sales</Button>
            <Button type="primary" shape="round">Sign Up</Button>
          </Space>
        </div>
        <Button className="md:hidden" icon={<MenuOutlined />} onClick={() => setDrawerVisible(true)} />

        <Drawer
          title="Menu"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
        >
          <Flex vertical gap={24}>
            <NavLinks />
            <Button type="primary" block shape="round">Sign Up</Button>
            <Button block>Contact Sales</Button>
          </Flex>
        </Drawer>
      </Header>

      <Content>
        {/* SECTION 1: HERO (Mobile Centered) */}
        <section className={styles.heroSection}>
          <Row gutter={[40, 48]} align="middle">
            <Col xs={24} lg={12} className={styles.mobileCenter}>
              <Badge count="Backed by Y Combinator" color="#fa8c16" />
              <Title level={1} className={styles.heroTitle}>
                Streamline Sales, <br />
                <span style={{ color: '#1890ff' }}>Maximize Growth</span>
              </Title>
              <Paragraph type="secondary" className={styles.heroSubText}>
                Take control of your operations with our intuitive dashboard. Track, analyze, and optimize every aspect of your business effortlessly.
              </Paragraph>
              <Space size="middle" wrap className={styles.mobileCenterSpace}>
                <Link href="/onboard" className={styles.heroLink}>Get Started</Link>
                <Button icon={<PlayCircleOutlined />} size="large" type="text">Watch Demo</Button>
              </Space>
            </Col>
            <Col xs={24} lg={12}>
              <div className={styles.heroImageWrapper}>
                <img
                  src="https://via.placeholder.com/600x450/f0f2f5/999?text=Dashboard+UI"
                  alt="Dashboard"
                  className={styles.heroImage}
                />
              </div>
            </Col>
          </Row>
        </section>

        {/* SECTION 2: LOGO CLOUD (Marquee Style on Mobile) */}
        <section className={styles.socialProof}>
          <Text type="secondary" className={styles.socialText}>
            Trusted by <Text strong>312k+</Text> ecommerce and <Text strong>12k+</Text> shop owners
          </Text>
          <div className={styles.logoScrollContainer}>
            <Flex justify="space-around" align="middle" wrap="wrap" className={styles.logoFlex}>
              {['ORVIS', 'LANDSEND', 'OfficeDepot', 'PETSMART', 'COSTCO', 'Walmart'].map(brand => (
                <span key={brand} className={styles.brandLogo}>{brand}</span>
              ))}
            </Flex>
          </div>
        </section>

        {/* SECTION 3: FEATURES (2x2 to 1x1) */}
        <section className={styles.featuresGrid}>
          <div className={styles.sectionHeader}>
            <Title level={2}>What Sets Us Apart</Title>
            <Paragraph type="secondary">Features that make managing operations easier.</Paragraph>
          </div>
          <Row gutter={[24, 24]}>
            <FeatureCard
              icon={<BarChartOutlined style={{ color: '#fa8c16' }} />}
              title="Customizable Views"
              desc="Tailor your dashboard with flexible layouts and data displays."
            />
            <FeatureCard
              icon={<NodeIndexOutlined style={{ color: '#1890ff' }} />}
              title="Real-Time Analytics"
              desc="Access live metrics to make informed decisions faster."
            />
          </Row>
        </section>


        {/* SECTION 4: SIMPLIFY YOUR WORKFLOW */}
        <section className={styles.workflowSection}>
          <div className={styles.sectionHeader}>
            <Title level={2}>Simplify Your Workflow</Title>
            <Paragraph type="secondary">
              Highlight the streamlined actions users can take within the dashboard,
              breaking it into manageable and engaging steps.
            </Paragraph>
          </div>

          <Row gutter={[64, 48]} align="middle">
            <Col xs={24} lg={10}>
              <div className={styles.workflowList}>
                <div
                  className={`${styles.workflowItem} ${activeWorkflow === 'track' ? styles.active : ''}`}
                  onClick={() => setActiveWorkflow('track')}
                >
                  <Title level={4}>Track Orders</Title>
                  <Text type="secondary">Monitor order processing, importing, and dispatching with real-time updates.</Text>
                  {activeWorkflow === 'track' && <div className={styles.activeIndicator} />}
                </div>

                <div
                  className={`${styles.workflowItem} ${activeWorkflow === 'analyze' ? styles.active : ''}`}
                  onClick={() => setActiveWorkflow('analyze')}
                >
                  <Title level={4}>Analyze Sales</Title>
                  <Text type="secondary">Dive into detailed insights by country, product, or timeframe to make data-driven decisions.</Text>
                  {activeWorkflow === 'analyze' && <div className={styles.activeIndicator} />}
                </div>

                <div
                  className={`${styles.workflowItem} ${activeWorkflow === 'team' ? styles.active : ''}`}
                  onClick={() => setActiveWorkflow('team')}
                >
                  <Title level={4}>Manage Team</Title>
                  <Text type="secondary">Assign roles, track performance, and collaborate seamlessly across teams.</Text>
                  {activeWorkflow === 'team' && <div className={styles.activeIndicator} />}
                </div>
              </div>
            </Col>
            <Col xs={24} lg={14}>
              <div className={styles.workflowPreview}>
                <img
                  src="https://via.placeholder.com/700x450/f9fafb/666?text=Interactive+Workflow+Preview"
                  alt="Workflow UI"
                  className={styles.dashboardImage}
                />
              </div>
            </Col>
          </Row>
        </section>

        {/* SECTION 5: STREAMLINE YOUR OPERATIONS (3-Card) */}
        <section className={styles.operationsSection}>
          <div className={styles.sectionHeader}>
            <Title level={2}>Streamline Your Operations</Title>
            <Paragraph type="secondary">
              Unlock the full potential of your business with tools to automate workflows,
              deliver insights, and centralize data.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card className={styles.opCard}>
                <img src="https://via.placeholder.com/300x180/fff/ccc?text=Workflow+Automation" alt="Automated" />
                <Title level={4} style={{ marginTop: 20 }}>Automated workflows</Title>
                <Text type="secondary">Simplify tasks with automation. Handle order updates, stock monitoring, and notifications effortlessly.</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className={styles.opCard}>
                <img src="https://via.placeholder.com/300x180/fff/ccc?text=Custom+Reporting" alt="Reporting" />
                <Title level={4} style={{ marginTop: 20 }}>Custom reporting</Title>
                <Text type="secondary">Generate tailored reports to focus on the metrics that matter. Visualize performance insights with confidence.</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className={styles.opCard}>
                <img src="https://via.placeholder.com/300x180/fff/ccc?text=Multi-Channel" alt="Insights" />
                <Title level={4} style={{ marginTop: 20 }}>Multi-Channel Insights</Title>
                <Text type="secondary">Track and analyze sales performance across all channels from one unified dashboard.</Text>
              </Card>
            </Col>
          </Row>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Button type="primary" size="large" shape="round">Request a Demo</Button>
          </div>
        </section>

        {/* SECTION 6: INTEGRATIONS */}
        <section className={styles.integrationsSection}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <Title level={2}>Expand Your Reach with Integrations</Title>
              <Paragraph type="secondary" style={{ fontSize: 16 }}>
                Discover tools and platforms that integrate seamlessly with our dashboard.
                Simplify workflows and boost efficiency.
              </Paragraph>
              <Button size="large" shape="round">Full Integrations List</Button>
            </Col>
            <Col xs={24} lg={12}>
              <Flex wrap="wrap" gap={12} justify="center">
                {['Shopify', 'Slack', 'Mailchimp', 'Google Analytics', 'Zapier', 'Salesforce', 'Zendesk', 'PayPal', 'Notion'].map(item => (
                  <Tag key={item} className={styles.integrationTag}>
                    {/* alt="" marks the avatar decorative, which it is: the same
                        name is already the Tag's visible text one node later, so
                        a descriptive alt would make a screen reader announce
                        every integration twice. Without any alt at all the <img>
                        AntD renders is an unlabelled image and fails axe. */}
                    <Avatar
                      size="small"
                      alt=""
                      style={{ marginRight: 8 }}
                      src={`https://ui-avatars.com/api/?name=${item}&background=random`}
                    />
                    {item}
                  </Tag>
                ))}
                <Tag className={styles.integrationTag} color="black">+14 more</Tag>
              </Flex>
            </Col>
          </Row>
        </section>


        {/* SECTION 7: PRICING */}
        <section className={styles.pricingSection}>
          <div className={styles.sectionHeader}>
            <Title level={2}>Flexible Plans for Every Need</Title>
            <Paragraph type="secondary">Choose the plan that fits your needs. Whether starting small or scaling up.</Paragraph>
            <Segmented
              options={['Monthly', 'Yearly']}
              value={billingCycle}
              onChange={(value) => setBillingCycle(value as any)}
              className={styles.billingToggle}
            />
          </div>

          <Row gutter={[24, 24]} align="bottom">
            <Col xs={24} lg={8}>
              <PriceCard
                title="Free"
                price="$0"
                desc="Get started with the essentials to manage your e-commerce operations."
                features={['Access to basic features', 'Manage up to 50 products', 'Track up to 100 orders monthly', 'Email support']}
              />
            </Col>
            <Col xs={24} lg={8}>
              <PriceCard
                title="Pro"
                price={billingCycle === 'Monthly' ? '$49' : '$39'}
                desc="Unlock advanced tools and insights to scale your business."
                features={['Access to all advanced features', 'Manage unlimited products', 'Track unlimited orders', 'Priority support']}
                isFeatured={true}
              />
            </Col>
            <Col xs={24} lg={8}>
              <PriceCard
                title="Enterprise"
                price="Custom"
                desc="Custom solutions designed for large-scale operations with dedicated support."
                features={['All from Pro plan', 'Fully customizable features', 'Dedicated account manager', 'API access and integrations']}
              />
            </Col>
          </Row>
        </section>

        {/* SECTION 8: FAQ */}
        <section className={styles.faqSection}>
          <div className={styles.sectionHeader}>
            <Title level={2}>All Your Questions, Answered</Title>
            <Paragraph type="secondary">Find quick answers to the most commonly asked questions.</Paragraph>
          </div>
          <Collapse
            ghost
            expandIconPlacement="end"
            className={styles.faqCollapse}
            expandIcon={({ isActive }) => isActive ? <MinusOutlined /> : <PlusOutlined />}
            items={faqData}
          />
        </section>

        {/* SECTION 9: FINAL CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <Row gutter={[40, 40]} align="middle">
              <Col xs={24} lg={12}>
                <Title level={2} style={{ color: '#fff', fontSize: '40px' }}>
                  Take Control of Your E-Commerce Today!
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
                  Streamline your operations, track sales, and manage your team efficiently with our powerful dashboard.
                </Paragraph>
                <Row gutter={[32, 32]} style={{ marginTop: 32, marginBottom: 40 }}>
                  <Col span={8}><Statistic title="75%" value="Increase Efficiency" styles={CTA_STAT_STYLES} /></Col>
                  <Col span={8}><Statistic title="500+" value="Teams Empowered" styles={CTA_STAT_STYLES} /></Col>
                  <Col span={8}><Statistic title="99.9%" value="Uptime Guarantee" styles={CTA_STAT_STYLES} /></Col>
                </Row>
                <Button size="large" shape="round" className={styles.whiteBtn}>Request a Demo</Button>
              </Col>
              <Col xs={24} lg={12}>
                <img
                  src="https://via.placeholder.com/500x350/ffffff22/ffffff?text=Dashboard+Preview"
                  alt="CTA Mockup"
                  className={styles.ctaImage}
                />
              </Col>
            </Row>
          </div>
        </section>


        <footer className={styles.footerContainer}>
          <Row gutter={[48, 40]}>
            {/* Brand Column */}
            <Col xs={24} lg={8}>
              <div className={styles.footerBrand}>
                <ThunderboltOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
                <span style={{ fontWeight: 800, fontSize: '20px', marginLeft: '8px' }}>ShopWave</span>
              </div>
              <Paragraph type="secondary" style={{ marginTop: 16, maxWidth: 300 }}>
                Empowering e-commerce growth, one dashboard at a time.
              </Paragraph>
              <Space size="large" className={styles.socialIcons}>
                <FacebookFilled />
                <InstagramFilled />
                <XOutlined />
                <LinkedinFilled />
                <YoutubeFilled />
              </Space>
            </Col>

            {/* Links Columns */}
            {footerLinks.map((group) => (
              <Col xs={12} sm={6} lg={4} key={group.title}>
                <Title level={5} style={{ marginBottom: 24, fontSize: '16px' }}>{group.title}</Title>
                <Flex vertical gap={12}>
                  {group.links.map((link) => (
                    // NOTE: href={link} yields a relative href like "Dashboard".
                    // Left as-is — these need real destinations, see the report.
                    // `type="secondary"` was dropped: it is a Typography prop and
                    // did nothing on the anchor next/link renders (.footerLink
                    // sets no colour, so appearance is unchanged).
                    <Link href={link} key={link} className={styles.footerLink}>
                      {link}
                    </Link>
                  ))}
                </Flex>
              </Col>
            ))}
          </Row>

          <Divider style={{ margin: '64px 0 32px' }} />

          <Flex justify="space-between" align="middle" wrap="wrap" gap={16}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              © {currentYear} ShopWave. All rights reserved.
            </Text>
            <Space size="large" className={styles.legalLinks}>
              <Text type="secondary">Privacy Policy</Text>
              <Text type="secondary">Terms of Service</Text>
              <Text type="secondary">Cookies Settings</Text>
            </Space>
          </Flex>
        </footer>


      </Content>
    </Layout>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <Col xs={24} sm={12}>
    <Card className={styles.card}>
      <div className={styles.iconBox}>{icon}</div>
      <Title level={4}>{title}</Title>
      <Text type="secondary">{desc}</Text>
    </Card>
  </Col>
);
const PriceCard = ({ title, price, desc, features, isFeatured = false }: any) => (
  <Card className={`${styles.priceCard} ${isFeatured ? styles.featuredCard : ''}`}>
    <Text strong style={{ color: isFeatured ? '#1890ff' : '#000' }}>{title}</Text>
    <div style={{ margin: '16px 0' }}>
      <span style={{ fontSize: '40px', fontWeight: 700 }}>{price}</span>
      {price !== 'Custom' && <span style={{ color: '#8c8c8c' }}> / per month</span>}
    </div>
    <Paragraph type="secondary" style={{ minHeight: '60px' }}>{desc}</Paragraph>
    <Button
      type={isFeatured ? 'primary' : 'default'}
      block
      shape="round"
      size="large"
      style={{ marginBottom: 32 }}
    >
      {title === 'Enterprise' ? 'Contact Us' : (isFeatured ? 'Get Started' : 'Sign Up Now')}
    </Button>
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      {features.map((f: string) => (
        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircleFilled style={{ color: isFeatured ? '#52c41a' : '#d9d9d9' }} />
          <Text>{f}</Text>
        </div>
      ))}
    </Space>
  </Card>
);
export default LandingPage;