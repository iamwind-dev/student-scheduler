import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest, graphConfig } from '../authConfig';

/**
 * Component để fetch và hiển thị thông tin user từ Microsoft Graph API
 */
function ProfileData() {
  const { instance, accounts } = useMsal();
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0]
      });

      const graphResponse = await fetch(graphConfig.graphMeEndpoint, {
        headers: {
          Authorization: `Bearer ${response.accessToken}`
        }
      });

      const data = await graphResponse.json();
      setGraphData(data);
    } catch (error) {
      console.error('Error fetching graph data:', error);
      
      // Nếu silent token acquisition fail, thử lại với popup
      try {
        const response = await instance.acquireTokenPopup(loginRequest);
        const graphResponse = await fetch(graphConfig.graphMeEndpoint, {
          headers: {
            Authorization: `Bearer ${response.accessToken}`
          }
        });
        const data = await graphResponse.json();
        setGraphData(data);
      } catch (popupError) {
        console.error('Error in popup token acquisition:', popupError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      fetchGraphData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!graphData) {
    return null;
  }

  return (
    <div className="profile-data">
      <h3>Thông tin người dùng</h3>
      <p><strong>Tên:</strong> {graphData.displayName}</p>
      <p><strong>Email:</strong> {graphData.mail || graphData.userPrincipalName}</p>
      <p><strong>ID:</strong> {graphData.id}</p>
      {graphData.jobTitle && <p><strong>Chức vụ:</strong> {graphData.jobTitle}</p>}
      {graphData.officeLocation && <p><strong>Văn phòng:</strong> {graphData.officeLocation}</p>}
    </div>
  );
}

export default ProfileData;
