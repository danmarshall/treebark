import type { Example } from './types.js';

export const conditionalIfNested: Example = {
  template: {
    div: {
      class: "access-control",
      $children: [
        { h2: "Document Access" },
        {
          $if: {
            $check: "hasPermission",
            $then: {
              div: {
                class: "content-area",
                $children: [
                  { h3: "Secure Document" },
                  { p: "This is protected content." },
                  {
                    $if: {
                      $check: "isVerified",
                      $then: {
                        div: {
                          style: {
                            background: "lightgreen",
                            padding: "10px"
                          },
                          $children: [
                            { strong: "✓ Verified Access" },
                            { p: "You have full access to this document." }
                          ]
                        }
                      }
                    }
                  },
                  {
                    $if: {
                      $check: "isVerified",
                      $not: true,
                      $then: {
                        p: {
                          style: { color: "orange" },
                          $children: ["⚠ Limited access - verification pending"]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        {
          $if: {
            $check: "hasPermission",
            $not: true,
            $then: {
              div: {
                style: {
                  background: "#ffe0e0",
                  padding: "15px",
                  border: "2px solid red"
                },
                $children: [
                  { strong: "Access Denied" },
                  { p: "You do not have permission to view this content." }
                ]
              }
            }
          }
        }
      ]
    }
  },
  data: {
    hasPermission: true,
    isVerified: true
  }
};
