import {View, Text, Button, TextInput} from 'react-native';
import React, {useEffect, useState} from 'react';
import {NetworkInfo} from 'react-native-network-info';
import UdpSocket from 'react-native-udp';
import styles from './styles';

const HomeScreen = () => {
  const [isServer, setIsServer] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [socket, setSocket] = useState<any>('');
  const [message, setMessage] = useState('');
  const [ipServer, setIpServer] = React.useState('IP Server');

  useEffect(() => {
    const fetchIpAddress = async () => {
      const ip = await NetworkInfo.getIPV4Address();
      if (ip) {
        setIpAddress(ip);
      }
    };

    fetchIpAddress();

    if (isServer) {
      // Configura la aplicación como servidor
      const server = UdpSocket.createSocket({type: 'udp4', reusePort: true});

      server.on('message', (data: any, rinfo: any) => {
        setMessage(data.toString());
        server.send(
          'Hello from the server!',
          undefined,
          undefined,
          rinfo?.port,
          rinfo?.address,
          error => {
            if (error) {
              console.log('Error sending the message:', error);
            } else {
              console.log('Message sent successfully');
            }
          },
        );
        console.log('Message received:', data.toString());
      });

      server.on('listening', () => {
        console.log('Server listening on port:', server.address().port);
        setConnectionStatus(
          `Server listening on port ${server.address().port}`,
        );
      });

      server.bind(8888);

      setSocket(server);
    } else {
      setConnectionStatus('Server disconnected');
      // Configura la aplicación como cliente
      const client = UdpSocket.createSocket({type: 'udp4', reusePort: true});
      client.bind(8887);
      setSocket(client);
    }
  }, [isServer]);

  const sendMessage = () => {
    if (isServer) {
      return;
    }

    const client = socket;

    client.send(
      'Hello from the client!',
      undefined,
      undefined,
      8888,
      ipServer, // Ensure this is correctly set to the server's IP
      error => {
        if (error) {
          console.log('Error sending the message:', error);
        } else {
          console.log('Message sent successfully');
        }
      },
    );
    client.on('message', async (message, remoteInfo) => {
      setMessage(message.toString());
    });
  };

  return (
    <View style={styles.container}>
      <Text>{connectionStatus}</Text>
      <Button
        title={isServer ? 'Stop Server' : 'Start Server'}
        onPress={() => setIsServer(!isServer)}
      />
      <Button title="Send Message" onPress={sendMessage} disabled={isServer} />
      <TextInput onChangeText={setIpServer} value={ipServer} />
      <Text>IP Address: {ipAddress}</Text>
      <Text>Message received: {message}</Text>
    </View>
  );
};

export default HomeScreen;
