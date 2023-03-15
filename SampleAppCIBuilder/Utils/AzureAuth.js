import AzureAuth from 'react-native-azure-auth';
import Client from 'react-native-azure-auth/src/networking';

const CLIENT_ID = '755b9f3e-90d3-46bd-a986-ef86ed758d19' // replace the string with YOUR client ID

const azureAuth = new AzureAuth({
    clientId: CLIENT_ID
  });

//Login Call
onLogin = async () => {
    try {
      let tokens = await azureAuth.webAuth.authorize({scope: 'openid profile User.Read' })
      console.log('CRED>>>', tokens)
      this.setState({ accessToken: tokens.accessToken });
      let info = await azureAuth.auth.msGraphRequest({token: tokens.accessToken, path: 'me'})
      console.log('info', info)
      this.setState({ user: info.displayName, userId: tokens.userId })
    } catch (error) {
      console.log('Error during Azure operation', error)
    }
  };

//Getting Mails  
onGetMails = async () => {
    try {
      let tokens = await azureAuth.auth.acquireTokenSilent({scope: 'Mail.Read', userId: this.state.userId})
      console.log('Silent:', tokens)
      if (!tokens) {
        tokens = await azureAuth.webAuth.authorize({scope: 'Mail.Read'})
        console.log('NewWeb:', tokens)
      }
      console.log('TOK>>>', tokens.accessToken)
      let mails = await azureAuth.auth.msGraphRequest({token: tokens.accessToken, path: '/me/mailFolders/Inbox/messages'})
      let mailArr = []
      mails.value.forEach(element => {
        mailArr.push({subject: element.subject})
      });
      if (mailArr.length === 0) {
        mailArr.push({subject: 'No mails found'})
      }
      console.log('Mails: ' + mailArr.length)
      this.setState({mails: mailArr})
    } catch (error) {
      console.log(error)
    }
  }

  //Logout call to close and clear the session
onLogout = () => {
    azureAuth.webAuth
      .clearSession()
      .then(success => {
        this.setState({ accessToken: null, user: null });
      })
      .catch(error => console.log(error));
  };
