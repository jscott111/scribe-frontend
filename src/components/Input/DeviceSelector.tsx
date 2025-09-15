import React, { useState, useEffect } from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Tooltip
} from '@mui/material'
import MicIcon from '@mui/icons-material/Mic'
import RefreshIcon from '@mui/icons-material/Refresh'
import Typography from '../UI/Typography'

interface AudioDevice {
  deviceId: string
  label: string
  kind: string
}

interface DeviceSelectorProps {
  selectedDeviceId: string | null
  onDeviceChange: (deviceId: string) => void
  disabled?: boolean
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  selectedDeviceId,
  onDeviceChange,
  disabled = false
}) => {
  const [devices, setDevices] = useState<AudioDevice[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const getAudioDevices = async () => {
    setIsLoading(true)
    try {
      // Request permission to access media devices
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Get all audio input devices
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = deviceList
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }))
      
      setDevices(audioInputs)
      
      // Auto-select first device if none selected
      if (audioInputs.length > 0 && !selectedDeviceId) {
        onDeviceChange(audioInputs[0].deviceId)
      }
    } catch (error) {
      console.error('Error accessing audio devices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getAudioDevices()
  }, [])

  const handleRefresh = () => {
    getAudioDevices()
  }

  const handleDeviceChange = (event: any) => {
    const deviceId = event.target.value
    onDeviceChange(deviceId)
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
      <FormControl fullWidth size="small" disabled={disabled || isLoading}>
        <InputLabel id="device-selector-label">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MicIcon sx={{ fontSize: 16 }} />
            <Typography variant="bodyText" sx={{ fontSize: '0.875rem' }}>
              Microphone
            </Typography>
          </Box>
        </InputLabel>
        <Select
          labelId="device-selector-label"
          value={selectedDeviceId || ''}
          onChange={handleDeviceChange}
          label="Microphone"
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }
          }}
        >
          {devices.map((device) => (
            <MenuItem key={device.deviceId} value={device.deviceId}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                <MicIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="bodyText" sx={{ fontSize: '0.875rem' }}>
                  {device.label}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Tooltip title="Refresh devices" arrow placement="top">
        <IconButton
          onClick={handleRefresh}
          disabled={disabled || isLoading}
          size="small"
          sx={{
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'rgba(210, 180, 140, 0.1)'
            }
          }}
        >
          <RefreshIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export default DeviceSelector
