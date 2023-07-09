
import { AspectRatio, Box, Text, Button, ButtonGroup, Stack, background } from '@chakra-ui/react'
import useAuth from './hooks/useAuth';
import ButtonCss from './LoginButton.module.css'




export const VideoGame = () => {
  const {data, error} = useAuth();

  if (error)
    return <p>{error.message}</p>;

  return (
    
  <Box position={'relative'}  marginBottom={"6%"} marginTop={"2%"} marginLeft={"10%"} marginRight={"10%"}>
    <AspectRatio position="relative" top={0} left={0} right={0} bottom={0}>
      <Box >
        <video src="./src/assets/pingp.mp4"  autoPlay loop muted/>
      </Box>
    </AspectRatio>
    <Box position="absolute" top={0} left={0} right={0} bottom={0} bg={'rgba(30, 12, 66 , 0.6)'}></Box>
    <Box color='white' position="absolute" top={'20%'} left={'10%'} right={'10%'} >
      <Text textAlign={'center'} fontSize={'17em'}  fontWeight={'bold'} lineHeight={'1em'}>Let The Game Begin!</Text>
      {/* <Text textAlign={'center'} fontSize={'17em'}>Begin!</Text> */}
      <Stack align={'center'} padding={'7%'}>
        <Button onClick={() => console.log('this: ', data)} className={[ButtonCss.buttonLog, ButtonCss.buttonText].join(' ')} borderRadius={'2xl'} width={'11%'} colorScheme='white' variant='outline'  fontSize={'2xl'} size={'lg'} fontWeight={'bold'} borderColor={'#9747FF'} >LOGIN</Button>
      </Stack>
     
    </Box>
  </Box>
  )
}

